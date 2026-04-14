-- =============================================================================
-- V53: Add partial index on cart_expires_at_utc for PendingPayment bookings
-- =============================================================================
-- The PaymentTimeoutJob runs every 60 seconds and calls:
--
--   SELECT b FROM Booking b
--   WHERE b.status = 'PendingPayment'
--     AND b.cartExpiresAtUtc IS NOT NULL
--     AND b.cartExpiresAtUtc < :now
--     AND b.deletedAtUtc IS NULL
--
-- Without an index this would be a full-table scan every minute.
-- This partial index covers only active PendingPayment rows (the hot set),
-- making the cleanup query O(log n) in the number of pending bookings.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_pending_payment_deadline
    ON bookings (cart_expires_at_utc)
    WHERE status = 'PendingPayment'
      AND deleted_at_utc IS NULL;
