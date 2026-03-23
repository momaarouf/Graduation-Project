-- V23: Add missing cancellation and refund fields to bookings table
-- Shifting from V22 to V23 to resolve Flyway checksum mismatch

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS cancelled_at_utc TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500),
    ADD COLUMN IF NOT EXISTS refund_percent DECIMAL(5, 2);
