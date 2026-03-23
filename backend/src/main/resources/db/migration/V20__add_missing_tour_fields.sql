-- V20: Add missing tour template fields for itinerary, inclusions, and meeting point details

ALTER TABLE tour_templates
    ADD COLUMN IF NOT EXISTS meeting_point_address VARCHAR(500),
    ADD COLUMN IF NOT EXISTS meeting_point_instructions TEXT,
    ADD COLUMN IF NOT EXISTS itinerary TEXT, -- JSON array of objects
    ADD COLUMN IF NOT EXISTS inclusions TEXT, -- JSON array of strings
    ADD COLUMN IF NOT EXISTS exclusions TEXT, -- JSON array of strings
    ADD COLUMN IF NOT EXISTS requirements TEXT, -- JSON array of strings
    ADD COLUMN IF NOT EXISTS what_to_bring TEXT; -- JSON array of strings
