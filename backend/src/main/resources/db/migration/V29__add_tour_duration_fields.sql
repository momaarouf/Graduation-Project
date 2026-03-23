-- Add duration fields to tour_templates
ALTER TABLE tour_templates 
ADD COLUMN duration_hours INTEGER DEFAULT 2,
ADD COLUMN duration_minutes INTEGER DEFAULT 0;

COMMENT ON COLUMN tour_templates.duration_hours IS 'Estimated duration in hours';
COMMENT ON COLUMN tour_templates.duration_minutes IS 'Estimated duration remaining minutes (0, 15, 30, 45)';
