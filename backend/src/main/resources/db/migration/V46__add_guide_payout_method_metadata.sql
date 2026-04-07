-- =============================================================================
-- V46: Add payout method metadata to guide_profiles
-- =============================================================================
-- These columns store public-safe metadata about the guide's connected payout 
-- method (e.g. "Visa ending in 4242") to display in the dashboard without 
-- needing to query Stripe directly for every page load.
-- =============================================================================

ALTER TABLE guide_profiles
    ADD COLUMN IF NOT EXISTS payout_method_last4 VARCHAR(4),
    ADD COLUMN IF NOT EXISTS payout_method_brand VARCHAR(20),
    ADD COLUMN IF NOT EXISTS payout_method_type VARCHAR(20);
