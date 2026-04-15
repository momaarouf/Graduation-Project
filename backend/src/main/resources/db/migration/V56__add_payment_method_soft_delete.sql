-- V56: Add soft-delete support to traveler_payment_methods
--
-- Payment method records must NEVER be hard-deleted for two reasons:
--   1. Stripe audit trail: the stripePaymentMethodId on each row is a Stripe
--      object reference. If we delete the row, we lose the linkage needed for
--      refunds, disputes, and Stripe reconciliation.
--   2. Financial audit: deleted card records may be referenced in older Payment
--      rows and must remain accessible.
--
-- Strategy: set deleted_at_utc = now(); filter WHERE deleted_at_utc IS NULL
-- on all read queries. The Stripe object is NOT detached from the customer in
-- Stripe itself (that is handled separately in the payment card if needed).

ALTER TABLE traveler_payment_methods
    ADD COLUMN IF NOT EXISTS deleted_at_utc TIMESTAMPTZ;

-- Partial index to keep the "list my cards" query fast after soft deletes accumulate.
CREATE INDEX IF NOT EXISTS idx_payment_methods_not_deleted
    ON traveler_payment_methods (traveler_profile_id)
    WHERE deleted_at_utc IS NULL;
