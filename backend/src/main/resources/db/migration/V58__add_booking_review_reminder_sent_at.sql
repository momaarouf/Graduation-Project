-- ─────────────────────────────────────────────────────────────────────────────
-- V58: Add review_reminder_sent_at to bookings
--
-- Purpose:
--   Track whether the 24-hour post-trip review reminder has already been sent
--   for a given booking. A NULL value means "not yet sent"; a non-null value
--   is the UTC timestamp of the single send, preventing duplicate emails.
--
-- Anti-duplication strategy:
--   The ReviewReminderJob reads only rows WHERE review_reminder_sent_at IS NULL,
--   then immediately stamps this column on each processed row. Even if the job
--   runs again before the DB write propagates (extremely unlikely with Postgres
--   SERIALIZABLE reads), the service-layer ReviewRepository.existsByBookingId()
--   check acts as a final guard.
--
-- Index rationale:
--   The scheduler query filters on:
--     status = 'Completed'
--     AND completed_at_utc BETWEEN :windowStart AND :windowEnd
--     AND review_reminder_sent_at IS NULL
--   A partial index on (completed_at_utc) WHERE review_reminder_sent_at IS NULL
--   keeps this extremely cheap — once a reminder is sent the row falls out of
--   the index automatically, so the index never grows unboundedly.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the tracking column (nullable — NULL means "reminder not yet sent")
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS review_reminder_sent_at TIMESTAMPTZ;

-- 2. Partial index: only un-sent reminders are ever scanned by the scheduler
CREATE INDEX IF NOT EXISTS idx_bookings_review_reminder_pending
    ON bookings (completed_at_utc)
    WHERE review_reminder_sent_at IS NULL;
