-- V30: Add tags and languages to tour templates
ALTER TABLE tour_templates 
ADD COLUMN tags TEXT,
ADD COLUMN languages TEXT;
