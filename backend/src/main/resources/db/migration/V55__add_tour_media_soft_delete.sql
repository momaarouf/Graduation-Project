-- V55: Add soft-delete support to tour_media
--
-- TourMedia items (images/videos) are now soft-deleted instead of
-- hard-deleted when a guide removes an image from their tour.
-- This preserves audit history and allows future recovery.
--
-- Strategy: set deleted_at_utc to the deletion timestamp; leave the row in place.
-- All read queries will filter WHERE deleted_at_utc IS NULL.

ALTER TABLE tour_media
    ADD COLUMN IF NOT EXISTS deleted_at_utc TIMESTAMPTZ;

-- Partial index: speeds up the filtered read queries that exclude deleted media.
-- NULL values (= active media) are indexed; non-NULL rows are excluded.
CREATE INDEX IF NOT EXISTS idx_tour_media_not_deleted
    ON tour_media (tour_template_id, display_order)
    WHERE deleted_at_utc IS NULL;
