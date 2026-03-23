ALTER TABLE tour_templates
ADD COLUMN start_date_utc TIMESTAMP;

COMMENT ON COLUMN tour_templates.start_date_utc IS 'The anchor date and time for a tour. For one-time tours, this is the actual date. For recurring tours, this is the starting point.';
