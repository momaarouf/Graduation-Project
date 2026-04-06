package com.travelmarket.backend.payment.controller;

import com.travelmarket.backend.payment.dto.request.PaymentCreateRequest;
import com.travelmarket.backend.payment.dto.response.PaymentResponse;
import com.travelmarket.backend.payment.service.StripePaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Payment endpoints for the traveler-facing payment flow.
 *
 * ── Endpoints ─────────────────────────────────────────────────────────────────
 *   POST /api/payments/create-session        → create session, get checkoutUrl
 *   POST /api/payments/webhook               → Stripe calls this (NO JWT — signature verified)
 *   GET  /api/traveler/payments/{bookingId}  → traveler reads their payment status
 *
 * ── Security notes ───────────────────────────────────────────────────────────
 *   /api/payments/create-session → protected by JWT + Traveler role (SecurityConfig)
 *   /api/payments/webhook        → NO JWT; Stripe calls it directly.
 *                                  Security is via Stripe-Signature HMAC verification
 *                                  inside StripePaymentService.handleWebhook().
 *   /api/traveler/payments/**    → protected by JWT + Traveler role (SecurityConfig)
 *
 * ── Webhook raw body note ────────────────────────────────────────────────────
 *   The webhook endpoint reads the body as `byte[]` instead of a parsed DTO.
 *   This is critical: Stripe signs the exact raw byte sequence of the payload.
 *   If Spring parses the body as JSON first (even just to re-serialize it),
 *   the byte sequence changes and Stripe's signature verification fails.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    // ── Create Checkout Session ───────────────────────────────────────────────

    /**
     * Initiates payment for a PendingPayment booking.
     *
     * Normal mode: returns a real Stripe Checkout URL.
     * Mock mode:   returns a mock sessionId and instructions for Postman testing.
     *
     * Request:  { "bookingId": 42 }
     * Response: PaymentResponse with checkoutUrl (redirect traveler here)
     */
    @PostMapping("/api/payments/create-session")
    public ResponseEntity<PaymentResponse> createSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid PaymentCreateRequest request) {

        log.info("[PaymentController] create-session requested by {} for bookingId: {}",
                userDetails.getUsername(), request.getBookingId());

        PaymentResponse response = stripePaymentService.createCheckoutSession(
                userDetails.getUsername(), request);

        return ResponseEntity.ok(response);
    }

    // ── Stripe Webhook ────────────────────────────────────────────────────────

    /**
     * Stripe sends payment events here.
     *
     * CRITICAL: body is read as raw bytes — Spring must NOT parse it as JSON.
     * The `byte[]` parameter type prevents Spring from consuming the input stream.
     * Signature verification in StripePaymentService.handleWebhook() requires
     * the exact original bytes that Stripe signed.
     *
     * Events handled:
     *   checkout.session.completed → payment captured → booking CONFIRMED
     *   checkout.session.expired   → payment failed   → booking EXPIRED
     *
     * In mock mode: this endpoint is still registered but will rarely be called
     * (use /api/payments/mock/confirm instead). Safe to ignore in mock mode.
     *
     * Returns 200 always (after processing) — returning non-200 causes Stripe
     * to retry the same event for up to 3 days.
     */
    @PostMapping("/api/payments/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody byte[] payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        // In mock mode, skip webhook processing (no real Stripe events fired)
        if (sigHeader == null) {
            log.debug("[PaymentController] Webhook received with no Stripe-Signature header — skipping (mock mode?)");
            return ResponseEntity.ok().build();
        }

        stripePaymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }

    // ── Traveler: Check Payment Status ────────────────────────────────────────

    /**
     * Returns the current payment state for a booking.
     * Traveler can poll this after being redirected back from Stripe to confirm success.
     *
     * Also shows payout status for guide earnings transparency (future guide dashboard).
     */
    @GetMapping("/api/traveler/payments/{bookingId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                stripePaymentService.getPaymentStatus(userDetails.getUsername(), bookingId));
    }
}
