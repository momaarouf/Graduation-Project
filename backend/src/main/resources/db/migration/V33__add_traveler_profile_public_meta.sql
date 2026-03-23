-- V33: Add public metadata fields to traveler profiles
-- These fields are used for the public profile and dashboard pages.

ALTER TABLE traveler_profiles
    ADD COLUMN IF NOT EXISTS tagline VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);
