-- Lebanon-first verification: National ID (front+back) OR Passport (front only)
-- Selfie holding ID is always required.

ALTER TABLE guide_profiles
    ADD COLUMN IF NOT EXISTS id_document_type VARCHAR(30),           -- NATIONAL_ID / PASSPORT
    ADD COLUMN IF NOT EXISTS id_front_image TEXT,
    ADD COLUMN IF NOT EXISTS id_back_image TEXT,
    ADD COLUMN IF NOT EXISTS verification_submitted_at_utc TIMESTAMP,
    ADD COLUMN IF NOT EXISTS verification_rejected_reason VARCHAR(255);

-- Keep existing columns from V1:
-- id_verification_image (old) + selfie_image (old)
-- We'll keep them for backward compatibility, but the app will use the new fields.