-- Traveler location + extras
ALTER TABLE traveler_profiles
    ADD COLUMN home_country VARCHAR(60),
  ADD COLUMN home_city VARCHAR(80),
  ADD COLUMN nationality VARCHAR(80),
  ADD COLUMN date_of_birth DATE,
  ADD COLUMN travel_preferences_json TEXT;

-- Guide location + extras
ALTER TABLE guide_profiles
    ADD COLUMN base_country VARCHAR(60),
  ADD COLUMN base_city VARCHAR(80),
  ADD COLUMN bio TEXT,
  ADD COLUMN expertise_json TEXT;