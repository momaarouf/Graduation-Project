-- Add recurrence fields to tour_templates
ALTER TABLE tour_templates 
ADD COLUMN recurring_days VARCHAR(255),
ADD COLUMN recurring_until TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN tour_templates.recurring_days IS 'Comma-separated days of week (e.g., MONDAY,WEDNESDAY)';
COMMENT ON COLUMN tour_templates.recurring_until IS 'Optional end date for the recurrence pattern';
