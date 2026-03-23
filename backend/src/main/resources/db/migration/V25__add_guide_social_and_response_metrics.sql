-- Add social links and response metrics to guide profiles
ALTER TABLE guide_profiles
ADD COLUMN social_links_json TEXT,
ADD COLUMN response_rate DECIMAL(5, 2),
ADD COLUMN response_time_text VARCHAR(50);
