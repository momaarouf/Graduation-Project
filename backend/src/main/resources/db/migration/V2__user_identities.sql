CREATE TABLE user_identities (
                                 id BIGSERIAL PRIMARY KEY,
                                 user_id BIGINT NOT NULL REFERENCES users(id),
                                 provider VARCHAR(30) NOT NULL CHECK (provider IN ('google','facebook','apple')),
                                 provider_user_id VARCHAR(255) NOT NULL,
                                 created_at_utc TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 UNIQUE(provider, provider_user_id),
                                 UNIQUE(user_id, provider)
);