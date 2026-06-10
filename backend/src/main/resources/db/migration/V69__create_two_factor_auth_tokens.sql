CREATE TABLE two_factor_auth_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    created_at_utc TIMESTAMP NOT NULL,
    expires_at_utc TIMESTAMP NOT NULL,
    used_at_utc TIMESTAMP
);

CREATE INDEX idx_two_factor_auth_tokens_hash ON two_factor_auth_tokens(token_hash);
