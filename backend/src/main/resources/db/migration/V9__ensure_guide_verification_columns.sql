ALTER TABLE guide_profiles
    ADD COLUMN IF NOT EXISTS id_verification_image TEXT,
    ADD COLUMN IF NOT EXISTS selfie_image TEXT,
    ADD COLUMN IF NOT EXISTS id_document_type VARCHAR(30),
    ADD COLUMN IF NOT EXISTS id_front_image TEXT,
    ADD COLUMN IF NOT EXISTS id_back_image TEXT,
    ADD COLUMN IF NOT EXISTS verification_submitted_at_utc TIMESTAMP,
    ADD COLUMN IF NOT EXISTS verification_rejected_reason VARCHAR(255);