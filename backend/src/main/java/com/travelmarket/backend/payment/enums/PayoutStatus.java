package com.travelmarket.backend.payment.enums;

/**
 * Tracks the escrow-to-guide payout lifecycle after a tour booking is COMPLETED.
 *
 * ── Escrow Flow ─────────────────────────────────────────────────────────────
 *   1. Traveler pays → Payment.status = Captured
 *      Funds held in platform's Stripe account (escrow).
 *      PayoutStatus = Pending.
 *
 *   2. Tour completes → Booking.status = COMPLETED
 *      BookingService sets Payment.payoutEligibleAtUtc = completedAtUtc + 48h.
 *
 *   3. PayoutReleaseJob runs every hour.
 *      Finds Captured payments where:
 *        payoutStatus = Pending AND payoutEligibleAtUtc <= now()
 *      Calls Stripe Transfer API to move (finalPrice - platformFee) to guide.
 *      Sets payoutStatus = Transferred, stripeTransferId = transfer.getId().
 *
 *   4. If guide has no Stripe Connect account → PayoutStatus = Failed.
 *      Admin is notified to resolve manually.
 *
 * ── Test Mode ───────────────────────────────────────────────────────────────
 *   In Stripe test mode, Connect transfers work with test connected accounts.
 *   Create a test guide account via Stripe Dashboard → Connected accounts.
 *   Set guide_profiles.stripe_account_id = "acct_test_..."
 *   PayoutReleaseJob will transfer fake money to that account after 48h.
 *   For demo: shorten the freeze to 1 minute via application.properties.
 *
 * ── Future states ───────────────────────────────────────────────────────────
 *   Disputed → Admin freezes payout pending dispute resolution.
 *              Not implemented now; add to this enum when dispute card is built.
 */
public enum PayoutStatus {

    /**
     * Default state. Funds are held in the platform Stripe account.
     * Waiting for the 48h freeze window to expire after tour completion.
     * PayoutReleaseJob monitors this status.
     */
    Pending,

    /**
     * Stripe Transfer API call succeeded.
     * Funds have been moved from the platform account to the guide's connected account.
     * stripeTransferId and payoutReleasedAtUtc are set.
     */
    Transferred,

    /**
     * Stripe Transfer failed.
     * Most common cause: guide has not set up a Stripe Connect account
     * (stripe_account_id is NULL on guide_profiles).
     * Admin notification required. Money remains in platform account.
     */
    Failed
}
