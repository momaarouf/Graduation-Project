-- =============================================================================
-- V47: Add traveler_payment_methods table
-- =============================================================================
-- This table stores public-safe metadata for traveler's saved cards.
-- Used to facilitate one-click checkout in the traveler portal.
-- =============================================================================

CREATE TABLE traveler_payment_methods (
    id BIGSERIAL PRIMARY KEY,
    traveler_profile_id BIGINT NOT NULL,
    brand VARCHAR(30),
    last4 VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at_utc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_method_traveler_profile
        FOREIGN KEY (traveler_profile_id)
        REFERENCES traveler_profiles(id)
);

CREATE INDEX idx_payment_method_traveler ON traveler_payment_methods(traveler_profile_id);
