-- V26: Ensure tour_media.url is TEXT to support large base64 data
-- This is a safety migration to ensure the column is correctly typed regardless of previous migrations.

ALTER TABLE tour_media ALTER COLUMN url TYPE TEXT;
