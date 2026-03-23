-- V35: Add missing tour filter fields
-- These fields support the frontend search filters with real data.
-- Even though reviews are not yet implemented, average_rating and review_count 
-- provide the infrastructure for future rating-based filtering.

ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_family_friendly BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS has_group_discount BOOLEAN DEFAULT FALSE;

-- Add indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_tour_templates_rating ON tour_templates (average_rating);
CREATE INDEX IF NOT EXISTS idx_tour_templates_premium ON tour_templates (is_premium);
CREATE INDEX IF NOT EXISTS idx_tour_templates_family ON tour_templates (is_family_friendly);
CREATE INDEX IF NOT EXISTS idx_tour_templates_discount ON tour_templates (has_group_discount);
