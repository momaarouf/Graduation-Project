package com.travelmarket.backend.payment.enums;

/**
 * Lifecycle states for a Payment record.
 *
 * Must match V1 DB CHECK constraint exactly (Pascal-case):
 *   status IN ('Authorized','Captured','RefundedPartial','RefundedFull','Failed','Released')
 *
 * Stripe mapping:
 *   Authorized      → Stripe Checkout Session created; traveler redirected.
 *                     Funds not yet collected.
 *   Captured        → checkout.session.completed webhook received.
 *                     Funds held in platform Stripe account (escrow).
 *                     Booking transitions to CONFIRMED.
 *   Failed          → checkout.session.expired OR payment_intent.payment_failed.
 *                     Booking transitions to EXPIRED. Seats released.
 *   RefundedPartial → Partial refund issued via Stripe refund API (future refund card).
 *   RefundedFull    → Full refund issued (future refund card).
 *   Released        → Authorization released without capture (future void/cancel card).
 *
 * Test mode note:
 *   All transitions happen identically in Stripe test mode with fake money.
 *   Use card 4242 4242 4242 4242 to trigger Captured.
 *   Use card 4000 0000 0000 9995 to trigger Failed.
 */
public enum PaymentStatus {

    /**
     * Stripe Checkout Session created. Traveler has been redirected to Stripe.
     * checkoutUrl is set. No money collected yet.
     * If the traveler doesn't pay within 30 minutes, the session expires
     * and a checkout.session.expired webhook fires → status becomes Failed.
     */
    Authorized,

    /**
     * Payment successfully captured. Funds are in the platform Stripe account.
     * Booking transitions to CONFIRMED.
     * Payout to guide is scheduled: payout_eligible_at_utc = completedAtUtc + 48h.
     */
    Captured,

    /**
     * Payment failed (card declined) or Stripe session expired (30-min window).
     * Booking transitions to EXPIRED. Cart seats are released.
     */
    Failed,

    /** Partial refund issued via Stripe Refund API (future refund card). */
    RefundedPartial,

    /** Full refund issued via Stripe Refund API (future refund card). */
    RefundedFull,

    /**
     * Authorization released without capture.
     * Used for Request-to-Book flows where guide rejects after authorization.
     */
    Released
}
