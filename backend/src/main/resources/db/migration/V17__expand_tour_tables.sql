-- =============================================================================
-- V17: Expand tour tables for Tour CRUD & Scheduling card
--
-- Context: tour_templates, tour_occurrences, tour_media, tour_map_points,
-- and pricing_rules were created as skeleton tables in V1. This migration
-- adds all missing columns, corrects enum CHECK values to uppercase,
-- adds portfolio and admin-review support, and creates all indexes.
--
-- Design decisions captured here:
--   - Admin must approve a tour before it becomes PUBLISHED
--   - Guide can edit DRAFT, REJECTED, PUBLISHED, PAUSED → forces PENDING_REVIEW
--   - PENDING_REVIEW and ARCHIVED are locked for guide edits
--   - last_published_at_utc drives occurrence visibility during re-review,
--     and portfolio eligibility (was it ever approved and shown publicly?)
--   - show_in_portfolio lets the guide control per-tour portfolio visibility
--   - auto_cancel_if_min_not_met gives guide opt-out of 48h safety cancellation
--   - tour_media is a child table (one row per image/video, ordered by
--     display_order) — multiple media per tour is fully supported from V1
--
-- Written defensively: IF NOT EXISTS, DROP CONSTRAINT IF EXISTS, DO $$ blocks
-- Safe to run on a fresh DB or any existing environment with no real data.
-- =============================================================================


-- =============================================================================
-- 1. tour_templates — add all missing columns
-- =============================================================================

-- Short summary shown on public listing cards (required for PublicTourCardResponse)
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS short_description VARCHAR(500);

-- Category tag used for filtering (e.g. "Historical", "Adventure", "Culinary")
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Geographic region used for filtering (e.g. "North Lebanon", "Bekaa Valley")
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS region VARCHAR(100);

-- ISO 3166-1 alpha-2 country code; defaults to LB (Lebanon-first product)
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) NOT NULL DEFAULT 'LB';

-- Human-readable meeting point name shown to booked travelers
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS meeting_point_name VARCHAR(255);

-- Meeting point coordinates — used for future map UI on tour detail page
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS meeting_latitude DECIMAL(10, 8);

ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS meeting_longitude DECIMAL(11, 8);

-- Currency for base_price; defaults to USD (Lebanon market reality)
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'USD';

-- =============================================================================
-- Rename halal_badge → halal_friendly to match spec and entity naming
-- Wrapped in DO $$ so it is skipped safely if already renamed
-- =============================================================================
DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tour_templates' AND column_name = 'halal_badge'
        ) THEN
            ALTER TABLE tour_templates RENAME COLUMN halal_badge TO halal_friendly;
        END IF;
    END$$;

-- =============================================================================
-- Publication status — full 6-value lifecycle:
--
--   DRAFT          guide is building the tour; not visible publicly
--   PENDING_REVIEW guide submitted for admin approval; locked for editing
--   PUBLISHED      admin approved; visible on public listings and portfolio
--   PAUSED         guide temporarily hid the tour; stays in portfolio
--   REJECTED       admin rejected; guide can edit and resubmit
--   ARCHIVED       guide retired the tour permanently; stays in portfolio
--
-- Guide can never set status directly to PUBLISHED — only admin can do that.
-- =============================================================================
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';

-- Drop any previously added status CHECK before recreating with all 6 values
ALTER TABLE tour_templates
    DROP CONSTRAINT IF EXISTS tour_templates_status_check;

ALTER TABLE tour_templates
    ADD CONSTRAINT tour_templates_status_check
        CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'PAUSED', 'REJECTED', 'ARCHIVED'));

-- Soft enable/disable flag (independent of status; reserved for future admin tooling)
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- =============================================================================
-- Recurrence pattern — add CHECK to match RecurrencePattern enum values
-- V1 had no CHECK on this column
-- =============================================================================
ALTER TABLE tour_templates
    DROP CONSTRAINT IF EXISTS tour_templates_recurrence_pattern_check;

ALTER TABLE tour_templates
    ADD CONSTRAINT tour_templates_recurrence_pattern_check
        CHECK (recurrence_pattern IN ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY'));

-- =============================================================================
-- last_published_at_utc
--
-- Set when admin first approves OR re-approves the tour.
-- Two purposes:
--   1. Occurrence visibility during re-review: if this is NOT NULL, the tour
--      was previously approved so its occurrences stay visible publicly even
--      while status = PENDING_REVIEW (guide edited a live tour).
--   2. Portfolio eligibility: a tour only appears in a guide's portfolio if
--      this is NOT NULL — meaning it was vetted and shown publicly at least once.
--      DRAFT and REJECTED tours never qualify regardless of show_in_portfolio.
-- =============================================================================
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS last_published_at_utc TIMESTAMP;

-- =============================================================================
-- show_in_portfolio
--
-- Guide can toggle per-tour whether it appears in their public portfolio.
-- Defaults to TRUE so completed work shows automatically unless opted out.
-- Eligibility still requires last_published_at_utc IS NOT NULL.
-- =============================================================================
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS show_in_portfolio BOOLEAN NOT NULL DEFAULT TRUE;

-- =============================================================================
-- rejection_reason
--
-- Admin writes why the tour was rejected (visible to the guide only).
-- Cleared when the guide resubmits (service layer responsibility).
-- =============================================================================
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);

-- =============================================================================
-- auto_cancel_if_min_not_met
--
-- When TRUE (default), a scheduled job will soft-cancel the occurrence and
-- notify travelers if min_capacity is not met 48 hours before start_time_utc.
-- Guide can set this to FALSE per tour to disable the safety net.
-- The actual job is a future automation task — this column prepares the schema.
-- =============================================================================
ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS auto_cancel_if_min_not_met BOOLEAN NOT NULL DEFAULT TRUE;


-- =============================================================================
-- 2. tour_occurrences — fix status enum, add seats_reserved
-- =============================================================================

-- Drop the V1 status CHECK (title-case values, missing FULL)
ALTER TABLE tour_occurrences
    DROP CONSTRAINT IF EXISTS tour_occurrences_status_check;

-- Corrected CHECK matching TourOccurrenceStatus enum exactly
ALTER TABLE tour_occurrences
    ADD CONSTRAINT tour_occurrences_status_check
        CHECK (status IN ('SCHEDULED', 'FULL', 'COMPLETED', 'CANCELLED'));

-- Update the column default to match the new enum casing
ALTER TABLE tour_occurrences
    ALTER COLUMN status SET DEFAULT 'SCHEDULED';

-- seats_reserved: how many seats are currently taken by confirmed bookings.
-- Starts at 0. Booking card will increment/decrement this transactionally.
-- Also used in portfolio detail to show how many travelers attended each run.
ALTER TABLE tour_occurrences
    ADD COLUMN IF NOT EXISTS seats_reserved INT NOT NULL DEFAULT 0;


-- =============================================================================
-- 3. tour_media — fix media_type CHECK to match TourMediaType enum
--
-- V1 used title-case ('Image', 'Video').
-- Corrected to uppercase ('IMAGE', 'VIDEO') to match Java enum stored values.
-- Multiple media rows per template are supported from V1 via display_order.
-- =============================================================================
ALTER TABLE tour_media
    DROP CONSTRAINT IF EXISTS tour_media_media_type_check;

ALTER TABLE tour_media
    ADD CONSTRAINT tour_media_media_type_check
        CHECK (media_type IN ('IMAGE', 'VIDEO'));


-- =============================================================================
-- 4. pricing_rules — fix rule_type CHECK to match PricingRuleType enum
--
-- V1 used ('RushDay', 'Weekend', 'Holiday').
-- Corrected to ('RUSH_DAY', 'WEEKEND', 'HOLIDAY') to match Java enum.
-- Full dynamic pricing logic is a future card — structure exists now.
-- =============================================================================
ALTER TABLE pricing_rules
    DROP CONSTRAINT IF EXISTS pricing_rules_rule_type_check;

ALTER TABLE pricing_rules
    ADD CONSTRAINT pricing_rules_rule_type_check
        CHECK (rule_type IN ('WEEKEND', 'HOLIDAY', 'RUSH_DAY'));


-- =============================================================================
-- 5. Indexes
-- =============================================================================

-- tour_templates: ownership lookups, public listing filters, admin review queue

CREATE INDEX IF NOT EXISTS idx_tour_templates_guide_id
    ON tour_templates (guide_id);

CREATE INDEX IF NOT EXISTS idx_tour_templates_status
    ON tour_templates (status);

CREATE INDEX IF NOT EXISTS idx_tour_templates_region
    ON tour_templates (region);

CREATE INDEX IF NOT EXISTS idx_tour_templates_halal_friendly
    ON tour_templates (halal_friendly);

-- Public listing: published + not deleted (most frequent query path)
CREATE INDEX IF NOT EXISTS idx_tour_templates_status_deleted
    ON tour_templates (status, deleted_at_utc);

-- Portfolio listing: ever-published + portfolio opt-in + not deleted
CREATE INDEX IF NOT EXISTS idx_tour_templates_portfolio
    ON tour_templates (guide_id, last_published_at_utc, show_in_portfolio, deleted_at_utc);

-- Admin review queue: pending approval ordered by submission time
CREATE INDEX IF NOT EXISTS idx_tour_templates_pending_review
    ON tour_templates (status, created_at_utc)
    WHERE status = 'PENDING_REVIEW';

-- tour_occurrences: future occurrence queries and booking seat lookups

CREATE INDEX IF NOT EXISTS idx_tour_occurrences_template_id
    ON tour_occurrences (template_id);

CREATE INDEX IF NOT EXISTS idx_tour_occurrences_start_time
    ON tour_occurrences (start_time_utc);

CREATE INDEX IF NOT EXISTS idx_tour_occurrences_status
    ON tour_occurrences (status);

-- Most common public occurrence query: future + scheduled + not deleted
CREATE INDEX IF NOT EXISTS idx_tour_occurrences_template_start_status
    ON tour_occurrences (template_id, start_time_utc, status);

-- Portfolio detail: completed occurrences per template
CREATE INDEX IF NOT EXISTS idx_tour_occurrences_template_completed
    ON tour_occurrences (template_id, status)
    WHERE status = 'COMPLETED';

-- tour_media: load all media for a template ordered by display_order
CREATE INDEX IF NOT EXISTS idx_tour_media_template_id
    ON tour_media (tour_template_id);

-- pricing_rules: resolve active rules for a template
CREATE INDEX IF NOT EXISTS idx_pricing_rules_template_id
    ON pricing_rules (template_id);