package com.travelmarket.backend.booking.enums;

/**
 * Loyalty tier assigned to a TravelerProfile.
 *
 * The concrete thresholds (min trips) and discount percentages are NOT
 * hardcoded here — they live in {@code LoyaltyProperties} which is bound
 * from {@code application.properties} at startup.
 *
 * Tiers are ordered by progression: BRONZE → SILVER → GOLD.
 * The ordinal is therefore meaningful — do not reorder the constants.
 */
public enum LoyaltyTier {

    /**
     * Default tier for all new travelers.
     * No booking discount applied.
     */
    BRONZE,

    /**
     * Mid tier — awarded after reaching the configured Silver threshold.
     * Earns a moderate discount on future bookings.
     */
    SILVER,

    /**
     * Top tier — awarded after reaching the configured Gold threshold.
     * Earns the highest discount on future bookings.
     */
    GOLD
}
