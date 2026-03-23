-- Finalized V19 Migration
-- PURPOSE: Alter tour_media.url to TEXT to support large base64 data URLs
-- Applied to: tours schema

ALTER TABLE tour_media ALTER COLUMN url TYPE TEXT;
