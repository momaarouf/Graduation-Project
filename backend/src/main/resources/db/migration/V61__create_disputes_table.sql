-- ============================================================================
-- V61: Create disputes table
-- ============================================================================
-- PURPOSE:
--   Stores dispute records opened by travelers or guides on their bookings.
--   Admins review and resolve disputes, optionally triggering refunds.
--
-- DESIGN DECISIONS:
--   - UNIQUE(booking_id) enforces one active dispute per booking to prevent
--     spam. If a dispute is REJECTED the business can allow a new one;
--     the service layer enforces this by checking status != REJECTED.
--   - opened_by_user_id / against_user_id are both FK → users so we can
--     handle Guide-opens-dispute scenarios too (e.g., fraud by traveler).
--   - refund_amount nullable — only set when admin resolves with a refund.
--   - soft_delete not added here; disputes are permanent audit records.
-- ============================================================================

CREATE TABLE disputes (
    id                  BIGSERIAL PRIMARY KEY,

    -- The booking this dispute is about
    booking_id          BIGINT NOT NULL REFERENCES bookings(id),

    -- The user who opened the dispute (Traveler or Guide)
    opened_by_user_id   BIGINT NOT NULL REFERENCES users(id),

    -- The user the dispute is filed against (the other party)
    against_user_id     BIGINT NOT NULL REFERENCES users(id),

    -- Categorized reason for the dispute
    reason              VARCHAR(50) NOT NULL
        CHECK (reason IN ('POOR_SERVICE', 'NO_SHOW', 'PAYMENT_ISSUE', 'FRAUD', 'SAFETY', 'QUALITY', 'OTHER')),

    -- Detailed description provided by the opener
    description         TEXT NOT NULL,

    -- Current lifecycle state managed by admins
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED')),

    -- Admin's written explanation of the resolution or rejection reason
    resolution_note     TEXT,

    -- Amount to be refunded (only populated when admin resolves with refund)
    refund_amount       NUMERIC(10, 2),

    -- Standard audit timestamps (stored as UTC)
    created_at_utc      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at_utc      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Unique: one dispute per booking (prevents duplicate spam)
-- Note: service layer allows a new dispute if the previous one was REJECTED
CREATE UNIQUE INDEX uq_disputes_booking_id
    ON disputes (booking_id);

-- Fast lookup for admin dashboard — most recent disputes first
CREATE INDEX idx_disputes_status_created
    ON disputes (status, created_at_utc DESC);

-- Fast lookup for user's own disputes (opened by or against)
CREATE INDEX idx_disputes_opened_by
    ON disputes (opened_by_user_id);

CREATE INDEX idx_disputes_against
    ON disputes (against_user_id);
