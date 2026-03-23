-- V37: Add dynamic pricing and expanded halal details to tour templates
ALTER TABLE tour_templates ADD COLUMN dynamic_pricing TEXT;
ALTER TABLE tour_templates ADD COLUMN halal_details TEXT;
ALTER TABLE tour_templates ADD COLUMN group_discount_threshold INTEGER;
ALTER TABLE tour_templates ADD COLUMN group_discount_percent DECIMAL(5,2);
   -- JSON structure for food, prayer space, etc.
