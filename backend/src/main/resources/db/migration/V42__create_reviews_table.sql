-- ============================================================================
-- V42__add_review_future_columns.sql
-- ============================================================================
-- CONTEXT: The reviews table already exists from the initial schema migration.
-- This migration safely adds the future-ready columns that were not in the
-- original schema, using IF NOT EXISTS to be idempotent.
--
-- Columns added:
--   guide_reply / guide_replied_at  → guide response feature (Phase N)
--   is_hidden / hidden_reason       → admin moderation (Phase N)
--   report_count                    → abuse reporting (Phase N)
--
-- All columns are nullable or have defaults — zero impact on existing rows.
-- ============================================================================

-- ── Future-ready: Guide reply ─────────────────────────────────────────────
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS guide_reply       TEXT,
    ADD COLUMN IF NOT EXISTS guide_replied_at  TIMESTAMP WITH TIME ZONE;

-- ── Future-ready: Admin moderation ───────────────────────────────────────
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS is_hidden         BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hidden_reason     TEXT;

-- ── Future-ready: Abuse reporting ────────────────────────────────────────
ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS report_count      INT NOT NULL DEFAULT 0;

-- ── Indexes (safe to run even if already present) ────────────────────────
-- Admin moderation queue: "show all hidden reviews"
CREATE INDEX IF NOT EXISTS idx_reviews_is_hidden
    ON reviews (is_hidden)
    WHERE is_hidden = TRUE;