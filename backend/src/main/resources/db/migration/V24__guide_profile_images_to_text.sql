-- V24: Change guyide profile image URLs to TEXT to support Base64 data
ALTER TABLE guide_profiles
    ALTER COLUMN avatar_url TYPE TEXT,
    ALTER COLUMN cover_image_url TYPE TEXT;
