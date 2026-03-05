ALTER TABLE users
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (account_status IN ('ACTIVE','SUSPENDED','BANNED'));

ALTER TABLE users
    ADD COLUMN suspended_until_utc TIMESTAMP NULL;

ALTER TABLE users
    ADD COLUMN status_reason VARCHAR(255) NULL;