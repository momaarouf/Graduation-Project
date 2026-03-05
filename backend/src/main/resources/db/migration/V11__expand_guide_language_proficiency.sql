-- Allow the proficiency values used by the frontend.
-- Keep the old values too so existing data remains valid.

ALTER TABLE guide_languages
DROP CONSTRAINT IF EXISTS guide_languages_proficiency_check;

ALTER TABLE guide_languages
    ADD CONSTRAINT guide_languages_proficiency_check
        CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'));