-- Allow multi-step signup + OAuth: user can exist before phone/name are finalized
ALTER TABLE users
    ALTER COLUMN full_name DROP NOT NULL;

ALTER TABLE users
    ALTER COLUMN phone_e164 DROP NOT NULL;

-- Profile completion flag
ALTER TABLE users
    ADD COLUMN profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Agreements & preferences
ALTER TABLE users
    ADD COLUMN agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN agreed_to_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN newsletter_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN agreements_accepted_at_utc TIMESTAMP NULL;