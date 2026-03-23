-- V31: Add custom recurring dates and excluded dates to tour templates
ALTER TABLE tour_templates 
ADD COLUMN recurring_dates TEXT,
ADD COLUMN excluded_dates TEXT;

COMMENT ON COLUMN tour_templates.recurring_dates IS 'JSON array of specific ISO dates for CUSTOM recurrence pattern';
COMMENT ON COLUMN tour_templates.excluded_dates IS 'JSON array of ISO dates to skip in a regular recurrence pattern';
