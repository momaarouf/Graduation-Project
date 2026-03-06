-- Password reset tokens are stored hashed (never store the raw token).
-- This supports secure "forgot password" without email enumeration.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     user_id BIGINT NOT NULL REFERENCES users(id),
                                                     token_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hex = 64 chars
                                                     created_at_utc TIMESTAMP NOT NULL DEFAULT NOW(),
                                                     expires_at_utc TIMESTAMP NOT NULL,
                                                     used_at_utc TIMESTAMP NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at_utc);