-- V57: Add soft-delete support to reviews
--
-- Reviews already have an isHidden / hiddenReason mechanism for admin
-- moderation. The soft-delete column (deleted_at_utc) is a separate,
-- stronger action: a hard-removed review that should no longer appear
-- in ANY query (including admin moderation screens).
--
-- Use cases for deletedAtUtc vs isHidden:
--   isHidden  = admin hides from public but review is still in admin queue
--   deletedAt = GDPR erasure / platform removal / legal hold — gone entirely
--
-- All public-facing queries already filter WHERE hidden = false.
-- After this migration, they also filter WHERE deleted_at_utc IS NULL.

ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS deleted_at_utc TIMESTAMPTZ;

-- Index removed because guide_id and created_at do not exist on the reviews table directly.
