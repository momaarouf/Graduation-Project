package com.travelmarket.backend.payment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for payment-related endpoints.
 *
 * Returned by:
 *   POST /api/payments/create-session  → includes checkoutUrl; frontend redirects here
 *   GET  /api/traveler/payments/{bookingId} → status check; checkoutUrl may be null
 *
 * Field guide:
 *   checkoutUrl  → Only populated when status = Authorized (session is open).
 *                  Frontend must redirect the traveler to this URL immediately.
 *                  Expires after 30 minutes. If null, session already completed/expired.
 *
 *   payoutStatus → Tracks the guide payout lifecycle:
 *                    Pending     = funds held in platform account (escrow)
 *                    Transferred = funds sent to guide after 48h freeze
 *                    Failed      = transfer failed (guide has no Stripe account)
 *
 *   payoutEligibleAt → When the 48h freeze expires (= completedAtUtc + freezeHours).
 *                      Null until booking is COMPLETED.
 *                      Frontend can show guide a countdown: "Payout in X hours".
 *
 * Test mode:
 *   In Stripe test mode, checkoutUrl points to the live Stripe test checkout.
 *   Use card 4242 4242 4242 4242 to simulate a successful payment.
 *   Use card 4000 0000 0000 9995 to simulate a declined card.
 */
@Data
@Builder
public class PaymentResponse {

    // ── Identity ─────────────────────────────────────────────────────────────

    private Long paymentId;
    private Long bookingId;

    // ── Status ───────────────────────────────────────────────────────────────

    /**
     * Current payment status (from PaymentStatus enum).
     * Authorized → Captured (success) | Failed (declined/expired)
     */
    private String status;

    /**
     * Escrow payout status (from PayoutStatus enum).
     * Pending → Transferred (guide received funds) | Failed (transfer error)
     */
    private String payoutStatus;

    // ── Amounts ──────────────────────────────────────────────────────────────

    /** Total amount charged to the traveler (= booking.finalPrice). */
    private BigDecimal amount;

    /** ISO 4217 currency code (e.g. "USD"). */
    private String currency;

    // ── Stripe ───────────────────────────────────────────────────────────────

    /**
     * Stripe Checkout redirect URL.
     * Populated only when status = Authorized (session is open and not expired).
     * Frontend should redirect traveler to this URL as soon as it is received.
     */
    private String checkoutUrl;

    /**
     * Stripe Checkout Session ID (cs_...).
     * Useful for debugging; can be looked up in Stripe Dashboard.
     */
    private String sessionId;

    // ── Payout timing ────────────────────────────────────────────────────────

    /**
     * When the guide payout becomes eligible.
     * Null until booking reaches COMPLETED status.
     * = booking.completedAtUtc + app.payout.freeze-hours (default 48h, 0 for demo).
     * Can be displayed on guide dashboard as "Payout in X hours".
     */
    private Instant payoutEligibleAt;

    /**
     * When the payout was actually released to the guide.
     * Null until payoutStatus = Transferred.
     */
    private Instant payoutReleasedAt;

    // ── Timestamps ───────────────────────────────────────────────────────────

    /** When the Stripe Checkout Session was created. */
    private Instant authorizedAt;

    /** When the payment was confirmed (webhook processed). */
    private Instant capturedAt;

    /** When this Payment record was created. */
    private Instant createdAt;
}
