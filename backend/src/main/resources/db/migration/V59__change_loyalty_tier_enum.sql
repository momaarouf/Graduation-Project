-- V59: Migrate loyalty_tier column to uppercase ENUM values
--
-- Background:
--   The original V1 schema stored loyalty tier as VARCHAR with Title-Case
--   CHECK values ('Bronze', 'Silver', 'Gold', 'Platinum').
--   Java JPA @Enumerated(EnumType.STRING) with an uppercase enum (BRONZE, SILVER, GOLD)
--   requires the stored strings to also be uppercase.
--
-- This migration:
--   1. Drops the old Title-Case check constraint.
--   2. Uppercases all existing rows.
--   3. Reinstates the constraint for the 3 active tiers (BRONZE, SILVER, GOLD).
--      Platinum was defined in V1 but never used, so it is dropped from the constraint.
--      Add it back here if it becomes a future tier.

-- Step 1: Remove old check constraint (name matches what PostgreSQL generated from V1)
ALTER TABLE traveler_profiles
    DROP CONSTRAINT IF EXISTS traveler_profiles_loyalty_tier_check;

-- Step 2: Uppercase all existing values
--   'Bronze'   → 'BRONZE'
--   'Silver'   → 'SILVER'
--   'Gold'     → 'GOLD'
--   'Platinum' → 'PLATINUM' (no rows expected, but handled safely)
UPDATE traveler_profiles
SET loyalty_tier = UPPER(loyalty_tier)
WHERE loyalty_tier IS NOT NULL;

-- Step 3: Restore check constraint for the 3 active tiers
ALTER TABLE traveler_profiles
    ADD CONSTRAINT traveler_profiles_loyalty_tier_check
    CHECK (loyalty_tier IN ('BRONZE', 'SILVER', 'GOLD'));
