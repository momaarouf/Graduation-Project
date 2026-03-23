-- V21: Add public metadata fields to guide profiles
-- These fields are used for the public portfolio and profile pages.

ALTER TABLE guide_profiles
    ADD COLUMN IF NOT EXISTS tagline VARCHAR(255),
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS tour_count INT DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN guide_profiles.tour_count IS 'Cached count of portfolio-eligible tours to avoid expensive counts on every profile view.';
