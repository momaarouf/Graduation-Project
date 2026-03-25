-- =============================================================================
-- V39: Enhance waitlist and snapshots
-- =============================================================================
-- Adds people_count to waitlist_entries so we know how many seats the traveler
-- is waiting for.
--
-- This allows BookingService.promoteFromWaitlist() to selectively promote
-- only those who fit in the freed capacity.
-- =============================================================================

ALTER TABLE waitlist_entries
    ADD COLUMN IF NOT EXISTS people_count INTEGER NOT NULL DEFAULT 1;

-- Ensure platform_fee_snapshot exists on bookings (it was added in V38, but
-- we want to be sure it's usable).
-- No changes needed if V38 ran correctly.
