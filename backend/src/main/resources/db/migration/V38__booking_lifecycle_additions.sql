-- =============================================================================
-- V38: Booking lifecycle additions
-- =============================================================================
-- Adds columns required by the booking card that were not present in V1:
--
--   bookings:
--     - version             : JPA @Version for optimistic locking (race-safe seat reservation)
--     - platform_fee_snapshot: commission snapshotted at booking time (feeds cancellation calc)
--     - checked_in_at_utc   : set when guide marks QR check-in (CONFIRMED → IN_PROGRESS)
--     - completed_at_utc    : set when guide marks completed (IN_PROGRESS → COMPLETED)
--                             starts the 48 h payout freeze window (future payout card)
--
--   waitlist_entries:
--     - promoted            : true once this entry has been converted into a real Booking
--     - promoted_at_utc     : timestamp of promotion; payment card uses this for the
--                             timed payment window offered to the promoted traveler
--
-- Note: waitlist_entries already has position and notified from V1.
--       The bookings table already has cancelled_at_utc, cancellation_reason,
--       refund_percent from V23.
-- =============================================================================


-- ── bookings ──────────────────────────────────────────────────────────────────

-- JPA @Version column: prevents double-booking race conditions.
-- If two requests concurrently pass the capacity check and attempt to save,
-- the second writer will receive an OptimisticLockException (mapped to HTTP 409).
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Platform commission snapshotted at booking creation time.
-- The cancellation policy says "100% refund minus platform fee" for the > 48 h window.
-- Actual deduction logic and exact fee percent lives in the payment card.
-- Stored here so the payment card can compute the net refund without re-deriving it.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS platform_fee_snapshot DECIMAL(10, 2);

-- Timestamp set when the guide scans the traveler's QR and marks check-in.
-- Transitions the booking: CONFIRMED → IN_PROGRESS.
-- Used by the no-show / dispute card to determine if a traveler was physically present.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS checked_in_at_utc TIMESTAMPTZ;

-- Timestamp set when the guide marks the tour as completed for this booking.
-- Transitions the booking: IN_PROGRESS → COMPLETED.
-- This timestamp starts the 48 h payout freeze window (future payout card).
-- Also used by the review card as the review eligibility anchor point.
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS completed_at_utc TIMESTAMPTZ;


-- ── waitlist_entries ──────────────────────────────────────────────────────────

-- Set true when BookingService.promoteFromWaitlist() converts this entry into a Booking.
-- Soft-deletion follows immediately after promotion.
-- Retained alongside deleted_at_utc so historical queries can distinguish
-- "promoted" from "self-removed" exits from the queue.
ALTER TABLE waitlist_entries
    ADD COLUMN IF NOT EXISTS promoted BOOLEAN NOT NULL DEFAULT FALSE;

-- Timestamp of promotion.
-- Future payment card uses this as the anchor for a timed payment window:
-- if the promoted traveler doesn't pay within X minutes, move to the next entry.
ALTER TABLE waitlist_entries
    ADD COLUMN IF NOT EXISTS promoted_at_utc TIMESTAMPTZ;


-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fast lookup of all bookings for a traveler (GET /api/traveler/bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_traveler_id
    ON bookings (traveler_id);

-- Fast lookup of all bookings for an occurrence (guide dashboard, capacity checks)
CREATE INDEX IF NOT EXISTS idx_bookings_occurrence_id
    ON bookings (occurrence_id);

-- Booking status filter — used by admin tooling and future automation jobs
-- (e.g. expire all PENDING_GUIDE bookings older than 24 h)
CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings (status);

-- Waitlist queue order per occurrence — the most common waitlist query.
-- Partial index on active (non-deleted) entries only for maximum efficiency.
CREATE INDEX IF NOT EXISTS idx_waitlist_occurrence_position
    ON waitlist_entries (occurrence_id, position)
    WHERE deleted_at_utc IS NULL;

-- Traveler's active waitlist entries — used by GET /api/traveler/waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_traveler_active
    ON waitlist_entries (traveler_id)
    WHERE deleted_at_utc IS NULL;