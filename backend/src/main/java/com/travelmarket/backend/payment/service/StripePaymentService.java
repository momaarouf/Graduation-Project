package com.travelmarket.backend.payment.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.payment.dto.request.PaymentCreateRequest;
import com.travelmarket.backend.payment.dto.response.PaymentResponse;
import com.travelmarket.backend.payment.entity.Payment;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import com.travelmarket.backend.payment.repository.PaymentRepository;
import com.travelmarket.backend.entity.TravelerPaymentMethod;
import com.travelmarket.backend.repository.TravelerPaymentMethodRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

/**
 * Core Stripe payment service.
 *
 * Responsibilities:
 *   1. createCheckoutSession()     → creates Stripe Checkout Session + Payment row
 *   2. handleWebhook()             → verifies signature + dispatches to sub-handlers
 *   3. handleCheckoutCompleted()   → captures payment, confirms booking
 *   4. handleCheckoutExpired()     → fails payment, expires booking, releases seats
 *   5. scheduleGuidePayoutFor()    → sets payoutEligibleAtUtc when booking is COMPLETED
 *   6. getPaymentStatus()          → traveler reads their payment state
 *
 * ── Stripe Checkout Flow ─────────────────────────────────────────────────────
 * Traveler creates booking → PENDING_PAYMENT
 *   → POST /api/payments/create-session → checkoutUrl returned
 *   → Frontend redirects traveler to checkoutUrl
 *   → Traveler pays on Stripe-hosted page
 *   → Stripe fires checkout.session.completed OR checkout.session.expired
 *   → handleWebhook() dispatches → booking confirmed or expired
 *
 * ── Payout Flow ──────────────────────────────────────────────────────────────
 * Booking COMPLETED → scheduleGuidePayoutFor() → sets payoutEligibleAtUtc
 * PayoutReleaseJob runs hourly → finds eligible payouts
 *   → Stripe Transfer API → guide's Stripe Connect account
 *   → payoutStatus = Transferred
 *
 * ── Test Mode Instructions ───────────────────────────────────────────────────
 * 1. Run Stripe CLI:  stripe listen --forward-to localhost:8081/api/payments/webhook
 * 2. Use test card:   4242 4242 4242 4242 | any future date | any CVV
 * 3. Watch logs:      booking status will flip to Confirmed after webhook fires
 * 4. For payout demo: set app.payout.freeze-hours=0 in application.properties
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final TravelerProfileRepository travelerRepository;
    private final TravelerPaymentMethodRepository paymentMethodRepository;
    private final NotificationService notificationService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    /**
     * Payout freeze window in hours.
     * Default: 48 hours (production-safe).
     * Set to 0 in application.properties for immediate release during demos.
     * Example: app.payout.freeze-hours=0
     */
    @Value("${app.payout.freeze-hours:48}")
    private int payoutFreezeHours;

    /**
     * Mock mode flag — set stripe.mock-mode=true when Stripe is unavailable
     * (e.g. Lebanon, demo environments, CI/CD).
     *
     * When TRUE:
     *   - createCheckoutSession() skips the Stripe API call entirely.
     *   - Returns a mock sessionId ("mock_sess_...") and instructions URL.
     *   - Use POST /api/payments/mock/confirm/{sessionId} to simulate payment success.
     *   - Use POST /api/payments/mock/fail/{sessionId} to simulate payment failure.
     *   - PayoutReleaseJob still runs and simulates the transfer (marks Transferred).
     *
     * When FALSE (production):
     *   - Full Stripe API is used. Real money flows.
     *   - stripe.secret-key must be a valid sk_live_... or sk_test_... key.
     */
    @Value("${stripe.mock-mode:false}")
    private boolean mockMode;

    @PostConstruct
    public void init() {
        if (!mockMode) {
            // Only initialize real Stripe SDK when mock mode is off.
            Stripe.apiKey = stripeSecretKey;
            log.info("[Stripe] SDK initialized with real API key. Payout freeze: {} hour(s)", payoutFreezeHours);
        } else {
            log.info("[Stripe] ⚠️  MOCK MODE active — no real Stripe calls will be made.");
            log.info("[Stripe]    To confirm a payment: POST /api/payments/mock/confirm/{{sessionId}}");
            log.info("[Stripe]    To fail a payment:    POST /api/payments/mock/fail/{{sessionId}}");
            log.info("[Stripe]    Payout freeze window: {} hour(s)", payoutFreezeHours);
        }
    }

    // ── Create Checkout Session ───────────────────────────────────────────────

    /**
     * Creates a Stripe Checkout Session for a PendingPayment booking.
     * Returns a PaymentResponse containing the checkoutUrl to redirect the traveler.
     *
     * Idempotent: if an Authorized payment already exists for this booking
     * (e.g., traveler double-clicked), returns the existing session URL.
     */
    @Transactional
    public PaymentResponse createCheckoutSession(String email, PaymentCreateRequest request) {

        // 1. Validate booking exists and belongs to this traveler
        Booking booking = bookingRepository.findByIdAndTravelerUserEmail(request.getBookingId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found"));

        // 2. Booking must be awaiting payment — not already paid or in another state
        if (booking.getStatus() != BookingStatus.PendingPayment) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is not awaiting payment (current status: " + booking.getStatus() + ")");
        }

        // 3. Idempotency check — prevent duplicate Stripe sessions
        Optional<Payment> existingOpt = paymentRepository.findByBooking(booking);
        if (existingOpt.isPresent()) {
            Payment existing = existingOpt.get();

            // Already fully paid — reject
            if (existing.getStatus() == PaymentStatus.Captured) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This booking has already been paid");
            }

            // Session still open — return existing URL instead of creating another
            if (existing.getStatus() == PaymentStatus.Authorized && existing.getCheckoutUrl() != null) {
                log.info("[Stripe] Returning existing open session for booking ID: {}", booking.getId());
                return mapToResponse(existing);
            }
            // If Failed → fall through and create a fresh session below
        }

        // 4. Create checkout session (real Stripe or mock depending on config)
        String sessionId;
        String checkoutUrl;

        if (mockMode) {
            // ── Mock mode: skip Stripe API, generate a fake session ───────────
            sessionId  = "mock_sess_" + UUID.randomUUID().toString().replace("-", "");
            checkoutUrl = "MOCK — call POST /api/payments/mock/confirm/" + sessionId
                        + "  (or /mock/fail/" + sessionId + " to simulate decline)";
            log.info("[Stripe MOCK] Mock session created. BookingID: {}, SessionID: {}",
                    booking.getId(), sessionId);
        } else {
            // ── Real mode: call Stripe API ────────────────────────────────────
            Session session = createStripeSession(booking);
            sessionId  = session.getId();
            checkoutUrl = session.getUrl();
            log.info("[Stripe] Session created. BookingID: {}, SessionID: {}, Amount: {} {}",
                    booking.getId(), session.getId(),
                    booking.getFinalPrice(), booking.getCurrency());
        }

        // 5. Persist the Payment record (status = Authorized, payout = Pending)
        Payment payment = buildPaymentRecord(booking, sessionId, checkoutUrl);

        // Link cart expiry: 30-minute window either way
        booking.setCartExpiresAtUtc(Instant.now().plus(30, ChronoUnit.MINUTES));
        bookingRepository.save(booking);

        Payment saved = paymentRepository.save(payment);
        return mapToResponse(saved);
    }

    private Session createStripeSession(Booking booking) {
        try {
            // Stripe requires amounts in the smallest currency unit (cents for USD)
            long amountInCents = booking.getFinalPrice()
                    .multiply(BigDecimal.valueOf(100))
                    .longValue();

            String tourTitle   = booking.getOccurrence().getTemplate().getTitle();
            String description = booking.getPeopleCount() + " person(s) · "
                    + booking.getOccurrence().getStartTimeUtc();
            String currency    = (booking.getCurrency() != null
                    ? booking.getCurrency() : "USD").toLowerCase();

            // Session expiry: now + 30 minutes (Unix timestamp in seconds)
            long expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES).getEpochSecond();

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)

                    // Success redirect: booking page with ?payment=success query param
                    .setSuccessUrl(frontendBaseUrl + "/bookings/" + booking.getId() + "?payment=success")

                    // Cancel redirect: booking page with ?payment=cancelled (user backs out)
                    .setCancelUrl(frontendBaseUrl + "/bookings/" + booking.getId() + "?payment=cancelled")

                    // Session expires after 30 minutes — must match our cart window
                    .setExpiresAt(expiresAt)

                    // The single line item: the full booking price
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(currency)
                                    .setUnitAmount(amountInCents)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName(tourTitle)
                                                    .setDescription(description)
                                                    .build())
                                    .build())
                            .build())

                    // Metadata for reconciliation — lets us find booking from webhook payload
                    .putMetadata("bookingId", booking.getId().toString())

                    .build();

            return Session.create(params);

        } catch (StripeException e) {
            log.error("[Stripe] Failed to create session for booking {}: {}", booking.getId(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Payment service temporarily unavailable. Please try again.");
        }
    }

    private Payment buildPaymentRecord(Booking booking, String sessionId, String checkoutUrl) {
        Payment p = new Payment();
        p.setBooking(booking);
        p.setStripeSessionId(sessionId);
        p.setIdempotencyKey(UUID.randomUUID().toString());
        p.setAmountAuthorized(booking.getFinalPrice());
        p.setCurrency(booking.getCurrency() != null ? booking.getCurrency() : "USD");
        p.setStatus(PaymentStatus.Authorized);
        p.setPayoutStatus(PayoutStatus.Pending);
        p.setCheckoutUrl(checkoutUrl);
        p.setAuthorizedAtUtc(Instant.now());
        p.setRawProviderStatus(mockMode ? "mock.session.created" : "checkout.session.created");
        return p;
    }

    // ── Webhook Dispatcher ─────────────────────────────────────────────────────

    /**
     * Entry point for POST /api/payments/webhook.
     *
     * CRITICAL: payload must be the raw request body bytes.
     *   - Spring must NOT parse the body as JSON before this call.
     *   - Stripe computes the signature over the exact byte sequence.
     *   - If the body is re-serialized, signature verification fails every time.
     *
     * The PaymentController reads the body as byte[] and passes it here directly.
     */
    public void handleWebhook(byte[] payload, String sigHeader) {
        Event event;
        try {
            // Stripe verifies: HMAC-SHA256(secret, timestamp + payload) matches sig header.
            // Throws SignatureVerificationException if signature is invalid or replayed.
            event = Webhook.constructEvent(new String(payload), sigHeader, webhookSecret);

        } catch (SignatureVerificationException e) {
            // Invalid signature — reject immediately (could be a spoofed request)
            log.warn("[Stripe Webhook] Signature verification failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe signature");

        } catch (Exception e) {
            log.error("[Stripe Webhook] Failed to parse event: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed webhook payload");
        }

        log.info("[Stripe Webhook] Received: {} (ID: {})", event.getType(), event.getId());

        // Dispatch to the appropriate handler
        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "checkout.session.expired"   -> handleCheckoutExpired(event);
            // Log but don't fail on unrecognized events — Stripe sends many event types
            default -> log.debug("[Stripe Webhook] Unhandled event type: {}", event.getType());
        }
    }

    // ── Webhook: Payment Success ───────────────────────────────────────────────

    @Transactional
    protected void handleCheckoutCompleted(Event event) {
        Session session = extractSession(event);
        if (session == null) return;

        String sessionId = session.getId();

        // Look up the Payment row we created during createCheckoutSession()
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> {
                    log.error("[Stripe Webhook] No Payment found for session: {}", sessionId);
                    // Return 200 anyway so Stripe doesn't retry — we can't fix a missing record by retrying
                    return new ResponseStatusException(HttpStatus.OK, "Payment record not found (already processed?)");
                });

        // Idempotency guard — Stripe retries webhooks for up to 3 days if we return non-200.
        // If we already processed this, return immediately (idempotent).
        if (payment.getStatus() == PaymentStatus.Captured) {
            log.info("[Stripe Webhook] Already captured (idempotent). SessionID: {}", sessionId);
            return;
        }

        // ── Update Payment: funds captured ────────────────────────────────────
        payment.setStatus(PaymentStatus.Captured);
        payment.setCapturedAtUtc(Instant.now());
        payment.setAmountCaptured(payment.getAmountAuthorized());   // full capture
        payment.setRawProviderStatus("checkout.session.completed");
        payment.setCheckoutUrl(null);   // session complete — URL is expired anyway
        paymentRepository.save(payment);

        // ── Update Booking: traveler has a confirmed seat ─────────────────────
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.Confirmed);
        booking.setCartExpiresAtUtc(null);   // cart lock no longer needed
        bookingRepository.save(booking);
        
        notificationService.createNotification(
                booking.getTraveler().getUser().getId(),
                NotificationType.PAYMENT_SUCCESS,
                "Payment Successful",
                "Your payment of " + payment.getAmountCaptured() + " " + payment.getCurrency() + " was successful. Your booking is confirmed.",
                booking.getId().toString(),
                "BOOKING"
        );

        log.info("[Stripe Webhook] ✅ Payment captured. BookingID: {} → CONFIRMED. Amount: {} {}",
                booking.getId(), payment.getAmountCaptured(), payment.getCurrency());
    }

    // ── Webhook: Session Expired (traveler didn't pay in 30 min) ──────────────

    @Transactional
    protected void handleCheckoutExpired(Event event) {
        Session session = extractSession(event);
        if (session == null) return;

        String sessionId = session.getId();

        Payment payment = paymentRepository.findByStripeSessionId(sessionId).orElse(null);
        if (payment == null) {
            log.warn("[Stripe Webhook] No Payment found for expired session: {}", sessionId);
            return; // Not our session, or already cleaned up — return 200
        }

        // Idempotency: skip if already failed
        if (payment.getStatus() == PaymentStatus.Failed) {
            log.info("[Stripe Webhook] Payment already marked Failed (idempotent). SessionID: {}", sessionId);
            return;
        }

        // ── Mark payment failed ───────────────────────────────────────────────
        payment.setStatus(PaymentStatus.Failed);
        payment.setCheckoutUrl(null);
        payment.setRawProviderStatus("checkout.session.expired");
        paymentRepository.save(payment);

        // ── Expire the booking and release seats ──────────────────────────────
        Booking booking = payment.getBooking();
        if (booking.getStatus() == BookingStatus.PendingPayment) {
            booking.setStatus(BookingStatus.Expired);
            booking.setCancelledAtUtc(Instant.now());
            booking.setCancellationReason("Payment not completed within 30-minute window");
            bookingRepository.save(booking);
            
            notificationService.createNotification(
                    booking.getTraveler().getUser().getId(),
                    NotificationType.PAYMENT_FAILED,
                    "Payment Failed or Expired",
                    "Your payment window expired or failed for " + booking.getOccurrence().getTemplate().getTitle() + ". The booking has been cancelled.",
                    booking.getId().toString(),
                    "BOOKING"
            );

            log.info("[Stripe Webhook] ⏰ Session expired. BookingID: {} → EXPIRED. Seats released.",
                    booking.getId());
        }
    }

    // ── Payout Scheduling ──────────────────────────────────────────────────────

    /**
     * Called by BookingService when a booking transitions to COMPLETED.
     * Sets payoutEligibleAtUtc = completedAtUtc + payoutFreezeHours.
     * PayoutReleaseJob will find this payment and transfer funds to the guide.
     *
     * Safe to call multiple times — idempotent (skips if already scheduled).
     *
     * Demo tip: set app.payout.freeze-hours=0 to release payout immediately
     * after booking completion, without waiting 48 hours.
     */
    @Transactional
    public void scheduleGuidePayoutFor(Booking booking) {
        paymentRepository.findByBooking(booking).ifPresentOrElse(payment -> {

            // Only schedule payouts for payments that actually collected money
            if (payment.getStatus() != PaymentStatus.Captured) {
                log.debug("[Payout] BookingID: {} — no captured payment; skipping payout schedule.",
                        booking.getId());
                return;
            }

            // Idempotent: don't re-schedule if already set
            if (payment.getPayoutEligibleAtUtc() != null) {
                log.debug("[Payout] Already scheduled for BookingID: {}", booking.getId());
                return;
            }

            // Anchor: use completedAtUtc from booking (or now if not set yet)
            Instant completedAt = booking.getCompletedAtUtc() != null
                    ? booking.getCompletedAtUtc()
                    : Instant.now();

            // Add freeze window (0 hours in demo mode → eligible immediately)
            Instant eligibleAt = completedAt.plus(payoutFreezeHours, ChronoUnit.HOURS);
            payment.setPayoutEligibleAtUtc(eligibleAt);
            paymentRepository.save(payment);

            log.info("[Payout] Scheduled for BookingID: {}. Eligible at: {} ({} hour freeze)",
                    booking.getId(), eligibleAt, payoutFreezeHours);

        }, () -> log.debug("[Payout] No payment record found for BookingID: {} — skipping.",
                booking.getId()));
    }

    // ── Traveler: Payment Status Check ────────────────────────────────────────

    /**
     * GET /api/traveler/payments/{bookingId}
     * Returns the current payment state for the traveler's own booking.
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentStatus(String email, Long bookingId) {
        // Ownership check: booking must belong to this traveler
        bookingRepository.findByIdAndTravelerUserEmail(bookingId, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found"));

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No payment record found for this booking"));

        return mapToResponse(payment);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Safely extracts the Session object from a Stripe Event.
     * Returns null and logs a warning if deserialization fails.
     */
    private Session extractSession(Event event) {
        var deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isEmpty()) {
            log.warn("[Stripe Webhook] Could not deserialize Session from event: {}", event.getId());
            return null;
        }
        return (Session) deserializer.getObject().get();
    }

    // ── Mock Mode: Simulate Payment Success / Failure ─────────────────────────

    /**
     * Simulates a successful payment (replaces Stripe webhook in demo/mock mode).
     * Finds the payment by sessionId, marks it Captured, confirms the booking.
     * Safe to call in test/demo environments where real Stripe is unavailable.
     *
     * Called by: POST /api/payments/mock/confirm/{sessionId}
     */
    @Transactional
    public PaymentResponse mockConfirmPayment(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No payment found for session: " + sessionId));

        if (payment.getStatus() == PaymentStatus.Captured) {
            log.info("[Stripe MOCK] Payment already captured (idempotent). SessionID: {}", sessionId);
            return mapToResponse(payment);
        }

        // Simulate payment captured
        payment.setStatus(PaymentStatus.Captured);
        payment.setCapturedAtUtc(Instant.now());
        payment.setAmountCaptured(payment.getAmountAuthorized());
        payment.setRawProviderStatus("mock.payment.confirmed");
        payment.setCheckoutUrl(null);
        paymentRepository.save(payment);

        // Confirm the booking
        Booking booking = payment.getBooking();
        booking.setStatus(BookingStatus.Confirmed);
        booking.setCartExpiresAtUtc(null);
        bookingRepository.save(booking);
        
        notificationService.createNotification(
                booking.getTraveler().getUser().getId(),
                NotificationType.PAYMENT_SUCCESS,
                "Payment Successful",
                "Your payment of " + payment.getAmountCaptured() + " " + payment.getCurrency() + " was successful. Your booking is confirmed.",
                booking.getId().toString(),
                "BOOKING"
        );

        log.info("[Stripe MOCK] ✅ Payment confirmed. BookingID: {} → CONFIRMED. Amount: {} {}",
                booking.getId(), payment.getAmountCaptured(), payment.getCurrency());

        return mapToResponse(payment);
    }

    /**
     * Simulates a payment failure / session expiry (for negative-path testing).
     * Marks payment as Failed, booking as Expired.
     *
     * Called by: POST /api/payments/mock/fail/{sessionId}
     */
    @Transactional
    public PaymentResponse mockFailPayment(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No payment found for session: " + sessionId));

        if (payment.getStatus() == PaymentStatus.Failed) {
            return mapToResponse(payment);
        }

        payment.setStatus(PaymentStatus.Failed);
        payment.setCheckoutUrl(null);
        payment.setRawProviderStatus("mock.payment.failed");
        paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        if (booking.getStatus() == BookingStatus.PendingPayment) {
            booking.setStatus(BookingStatus.Expired);
            booking.setCancelledAtUtc(Instant.now());
            booking.setCancellationReason("[MOCK] Payment declined or session expired");
            bookingRepository.save(booking);
            
            notificationService.createNotification(
                    booking.getTraveler().getUser().getId(),
                    NotificationType.PAYMENT_FAILED,
                    "Payment Failed or Expired",
                    "Your payment window expired or failed for " + booking.getOccurrence().getTemplate().getTitle() + ". The booking has been cancelled.",
                    booking.getId().toString(),
                    "BOOKING"
            );
        }

        log.info("[Stripe MOCK] ❌ Payment failed. BookingID: {} → EXPIRED", booking.getId());
        return mapToResponse(payment);
    }

    /**
     * One-click payment using a saved traveler card.
     * For this demo, we simulate a successful transaction after verifying ownership.
     */
    @Transactional
    public PaymentResponse payWithSavedCard(String email, Long bookingId, Long paymentMethodId) {
        // 1. Verify card ownership
        TravelerPaymentMethod method = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment method not found"));

        if (!method.getTravelerProfile().getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not own this payment method");
        }

        // 2. Reuse standard creation logic but skip Stripe checkout
        PaymentCreateRequest createRequest = new PaymentCreateRequest();
        createRequest.setBookingId(bookingId);

        // createCheckoutSession ensures booking belongs to traveler and is PendingPayment
        PaymentResponse sessionResponse = createCheckoutSession(email, createRequest);

        // 3. Immediately confirm it (simulated capture)
        return mockConfirmPayment(sessionResponse.getSessionId());
    }

    /** Whether mock mode is active — used by MockPaymentController to guard endpoints. */
    public boolean isMockMode() {
        return mockMode;
    }

    /** Maps a Payment entity to the response DTO. */
    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getId())
                .bookingId(p.getBooking().getId())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .payoutStatus(p.getPayoutStatus() != null ? p.getPayoutStatus().name() : null)
                .amount(p.getAmountAuthorized())
                .currency(p.getCurrency())
                // Only expose checkoutUrl while session is open (Authorized state)
                .checkoutUrl(p.getStatus() == PaymentStatus.Authorized ? p.getCheckoutUrl() : null)
                .sessionId(p.getStripeSessionId())
                .payoutEligibleAt(p.getPayoutEligibleAtUtc())
                .payoutReleasedAt(p.getPayoutReleasedAtUtc())
                .authorizedAt(p.getAuthorizedAtUtc())
                .capturedAt(p.getCapturedAtUtc())
                .createdAt(p.getCreatedAtUtc())
                .build();
    }
}
