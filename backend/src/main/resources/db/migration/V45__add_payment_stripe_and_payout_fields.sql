-- =============================================================================
-- V45: Add Stripe Checkout + Payout / Escrow fields
-- =============================================================================
-- The payments and payment_webhook_events tables were created in V1 with a
-- provider-agnostic schema. This migration extends them with Stripe-specific
-- columns and adds the escrow payout tracking columns.
--
-- payments:
--   checkout_url         : Stripe Checkout redirect URL (returned to frontend)
--   payout_status        : Pending → Transferred / Failed (escrow lifecycle)
--   payout_eligible_at_utc : completedAtUtc + 48h — PayoutReleaseJob trigger
--   stripe_transfer_id   : Stripe Transfer ID after payout is released to guide
--   payout_released_at_utc : Timestamp when payout was sent to guide
--
-- guide_profiles:
--   stripe_account_id    : Guide's Stripe Connect account ID (e.g. "acct_...")
--                          Used by PayoutService to transfer funds to guide.
--                          In test mode this is a test connected account.
-- =============================================================================


-- ── payments: Stripe Checkout URL ─────────────────────────────────────────────

-- The Stripe Checkout redirect URL (https://checkout.stripe.com/c/pay/cs_test_...).
-- Returned to the frontend so it can redirect the traveler to the payment page.
-- Expires when the Stripe session expires (we configure a 30-minute expiry window).
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS checkout_url TEXT;


-- ── payments: Payout / Escrow lifecycle ───────────────────────────────────────

-- Tracks whether the platform has released the held funds to the guide.
-- Values: 'Pending' (default) → 'Transferred' | 'Failed'
-- NOT constrained with CHECK so future statuses (e.g. 'Disputed') can be added easily.
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payout_status VARCHAR(50) NOT NULL DEFAULT 'Pending';

-- The earliest timestamp at which the payout can be released to the guide.
-- Set by BookingService when the booking transitions to COMPLETED:
--   payout_eligible_at_utc = booking.completedAtUtc + 48 hours
-- PayoutReleaseJob runs every hour and transfers funds where:
--   payout_status = 'Pending' AND payout_eligible_at_utc <= now()
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payout_eligible_at_utc TIMESTAMPTZ;

-- Stripe Transfer ID (e.g. "tr_1ABC...") returned after a successful Stripe
-- Transfer API call. Set when payout_status transitions to 'Transferred'.
-- Used for reconciliation and audit purposes.
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255);

-- Exact timestamp when the payout was released to the guide's Stripe account.
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payout_released_at_utc TIMESTAMPTZ;


-- ── guide_profiles: Stripe Connect account ID ─────────────────────────────────

-- Each guide who wants to receive payouts must have a Stripe Connect account.
-- In Express mode, guides complete Stripe's onboarding flow and get an account
-- ID like "acct_1ABC...". In test mode this is a test connected account.
--
-- PayoutService uses this ID as the destination for Stripe Transfer calls.
-- If NULL, payout transitions to 'Failed' and admin is notified.
ALTER TABLE guide_profiles
    ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);


-- ── Indexes ───────────────────────────────────────────────────────────────────

-- PayoutReleaseJob query: find eligible pending payouts.
-- Partial index (only Pending rows) keeps it small and fast.
CREATE INDEX IF NOT EXISTS idx_payments_payout_pending
    ON payments (payout_eligible_at_utc)
    WHERE payout_status = 'Pending';

-- Fast lookup of a payment by Stripe session ID (used in webhook handler).
-- provider_txn_id holds the Stripe session ID (cs_...).
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session
    ON payments (provider_txn_id);
