-- Fix type mismatch: language_id is SMALLINT in DB, but JPA uses Long (BIGINT).
-- We standardize on BIGINT for IDs (best practice).

-- 1) Change languages.id to BIGINT
ALTER TABLE languages
ALTER COLUMN id TYPE BIGINT;

-- 2) Change guide_languages.language_id to BIGINT
ALTER TABLE guide_languages
ALTER COLUMN language_id TYPE BIGINT;