-- V34: Alter traveler profile image columns to TEXT
-- This allows for long base64 strings if needed, matching the guide profile implementation.

ALTER TABLE traveler_profiles
    ALTER COLUMN avatar_url TYPE TEXT,
    ALTER COLUMN cover_image_url TYPE TEXT;
