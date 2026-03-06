-- Adds a monotonic counter that invalidates existing access tokens immediately.
-- Any access JWT issued with an older token_version becomes invalid as soon as token_version increments.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 0;