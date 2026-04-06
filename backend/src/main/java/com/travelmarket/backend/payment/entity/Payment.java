package com.travelmarket.backend.payment.entity;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents one Stripe payment transaction for a Booking.
 *
 * ── Table ────────────────────────────────────────────────────────────────────
 * Maps to the "payments" table created in V1 (provider-agnostic schema)
 * extended with Stripe-specific + payout columns added in V45.
 * One Payment per Booking enforced by UNIQUE constraint on booking_id.
 *
 * ── Stripe Checkout Payment Flow ─────────────────────────────────────────────
 * 1. POST /api/payments/create-session
 *    → StripePaymentService creates Stripe Checkout Session
 *    → Payment saved: status = Authorized, stripeSessionId = "cs_...", checkoutUrl set
 *    → Frontend redirects traveler to checkoutUrl
 *
 * 2. Traveler pays (real or test card) on Stripe's hosted page
 *    → Stripe fires checkout.session.completed webhook
 *
 * 3. POST /api/payments/webhook (no JWT — signature verified instead)
 *    → PaymentController verifies Stripe-Signature header
 *    → StripePaymentService.handleCheckoutCompleted(sessionId):
 *         Payment.status = Captured, capturedAtUtc = now
 *         Booking.status = Confirmed
 *
 * ── Payout / Escrow Flow ─────────────────────────────────────────────────────
 * When Booking transitions to COMPLETED (guide marks it or auto-processor runs):
 *   → StripePaymentService.scheduleGuidePayoutFor(booking):
 *        Payment.payoutEligibleAtUtc = booking.completedAtUtc + 48h
 *        Payment.payoutStatus = Pending   (already the default)
 *
 * PayoutReleaseJob runs @Scheduled every hour:
 *   → Queries: Captured payments where payoutStatus=Pending AND payoutEligibleAtUtc <= now()
 *   → Calls Stripe Transfer API: (finalPrice - platformFee) → guide's Stripe account
 *   → Payment.payoutStatus = Transferred
 *   → Payment.stripeTransferId = "tr_..."
 *   → Payment.payoutReleasedAtUtc = now
 *
 * ── Test Mode (Demo) ─────────────────────────────────────────────────────────
 * All of this works identically in Stripe test mode with fake money:
 *   - Use test card 4242 4242 4242 4242 to simulate a successful payment
 *   - Stripe CLI forwards webhooks to localhost:8081
 *   - Set guide_profiles.stripe_account_id to a test connected account ID
 *   - PayoutReleaseJob transfers fake money to guide's test account
 *   - Set app.payout.freeze-hours=0 in application.properties to skip 48h for demo
 *
 * ── Idempotency ──────────────────────────────────────────────────────────────
 * idempotencyKey prevents duplicate Stripe sessions if frontend double-clicks.
 * StripePaymentService checks for an existing Authorized payment before
 * creating a new session — if found, returns the existing checkoutUrl.
 *
 * ── Future compatibility ──────────────────────────────────────────────────────
 * - Refund card: use amountRefunded, RefundedPartial/RefundedFull statuses
 * - Dispute card: add payoutStatus = Disputed (add to PayoutStatus enum)
 * - Request-to-Book full flow: create Payment after guide accepts (PendingGuide → PendingPayment)
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Core relationship ────────────────────────────────────────────────────

    /**
     * The booking this payment belongs to.
     * UNIQUE on booking_id ensures one Payment per Booking at the DB level.
     * For a re-initiated payment (e.g. session expired), the same row is reused
     * with a new stripeSessionId and checkoutUrl.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // ── Stripe identifiers ───────────────────────────────────────────────────

    /**
     * Stripe Checkout Session ID (e.g. "cs_test_a1B2c3...").
     * Stored in the provider_txn_id column (name kept from V1 for provider-agnosticism).
     * The webhook handler looks up the Payment by this value from the event payload.
     */
    @Column(name = "provider_txn_id")
    private String stripeSessionId;

    /**
     * UUID generated at Payment creation.
     * Passed to Stripe as the idempotency key for the Checkout Session creation call.
     * Prevents double-charging if the client retries.
     */
    @Column(name = "idempotency_key")
    private String idempotencyKey;

    // ── Amounts ──────────────────────────────────────────────────────────────

    /**
     * Amount passed to Stripe (= booking.finalPrice).
     * Stored in the smallest currency unit by Stripe; we store in major units here.
     */
    @Column(name = "amount_authorized", precision = 10, scale = 2)
    private BigDecimal amountAuthorized;

    /**
     * Amount actually captured (confirmed by Stripe webhook).
     * Equals amountAuthorized for standard full-price payments.
     * May differ for partial captures (not supported in Phase 1).
     */
    @Column(name = "amount_captured", precision = 10, scale = 2)
    private BigDecimal amountCaptured;

    /**
     * Total amount refunded so far (0 until a refund is issued).
     * Updated by the refund card implementation.
     */
    @Column(name = "amount_refunded", precision = 10, scale = 2)
    private BigDecimal amountRefunded = BigDecimal.ZERO;

    /** ISO 4217 currency code (e.g. "USD"). Copied from booking.currency. */
    @Column(length = 3)
    private String currency = "USD";

    // ── Payment status ───────────────────────────────────────────────────────

    /**
     * Current state in the Stripe payment lifecycle.
     * Serialized as the exact enum name to satisfy V1 DB CHECK constraint.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PaymentStatus status;

    // ── Stripe timestamps ────────────────────────────────────────────────────

    /** When the Stripe Checkout Session was created and traveler was redirected. */
    @Column(name = "authorized_at_utc")
    private Instant authorizedAtUtc;

    /**
     * When the checkout.session.completed webhook was processed.
     * Marks the point at which funds arrived in the platform account.
     */
    @Column(name = "captured_at_utc")
    private Instant capturedAtUtc;

    /** When the refund was processed (populated by future refund card). */
    @Column(name = "refunded_at_utc")
    private Instant refundedAtUtc;

    /**
     * Raw Stripe event type string (e.g. "checkout.session.completed").
     * Stored for debugging and audit; not used in business logic.
     */
    @Column(name = "raw_provider_status")
    private String rawProviderStatus;

    // ── V45: Stripe Checkout URL ─────────────────────────────────────────────

    /**
     * The hosted Stripe Checkout page URL (e.g. "https://checkout.stripe.com/c/pay/cs_test_...").
     * Returned to the frontend in PaymentResponse so it can redirect the traveler.
     * Valid for 30 minutes (configured on the Stripe Session via expires_at).
     * After expiry, traveler must call /create-session again to get a new URL.
     */
    @Column(name = "checkout_url", columnDefinition = "TEXT")
    private String checkoutUrl;

    // ── V45: Payout / Escrow lifecycle ──────────────────────────────────────

    /**
     * Tracks whether the platform has released the held funds to the guide.
     *
     * Pending     → default; funds held in platform Stripe account (escrow).
     * Transferred → Stripe Transfer API succeeded; guide received payment.
     * Failed      → Transfer failed (guide has no Stripe Connect account, etc.).
     *
     * See PayoutStatus enum for full documentation.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "payout_status", length = 50)
    private PayoutStatus payoutStatus = PayoutStatus.Pending;

    /**
     * The earliest timestamp at which the payout can be released to the guide.
     * Set when the booking transitions to COMPLETED:
     *   payoutEligibleAtUtc = booking.completedAtUtc + app.payout.freeze-hours
     *
     * Default freeze: 48 hours (set in application.properties).
     * For demo: set to 0 hours to release immediately after completion.
     *
     * NULL until the booking is COMPLETED (payout not yet scheduled).
     */
    @Column(name = "payout_eligible_at_utc")
    private Instant payoutEligibleAtUtc;

    /**
     * Stripe Transfer ID (e.g. "tr_1ABC...") returned by the Stripe Transfer API.
     * Set when payoutStatus transitions to Transferred.
     * Used for reconciliation, audit, and dispute investigation.
     */
    @Column(name = "stripe_transfer_id")
    private String stripeTransferId;

    /** Exact timestamp when the payout was released to the guide's Stripe account. */
    @Column(name = "payout_released_at_utc")
    private Instant payoutReleasedAtUtc;

    // ── Audit timestamps ─────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
        updatedAtUtc = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAtUtc = Instant.now();
    }
}
