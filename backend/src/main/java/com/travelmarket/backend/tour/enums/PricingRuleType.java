package com.travelmarket.backend.tour.enums;

/**
 * Identifies which condition triggers a dynamic price adjustment.
 *
 * WEEKEND → multiplier applied on Saturday/Sunday bookings
 * HOLIDAY → multiplier applied on public holidays
 * RUSH_DAY → multiplier applied when remaining seats drop below a threshold
 *
 * Full dynamic pricing logic is out of scope for the current card.
 * This structure is created now for forward compatibility.
 *
 * Stored as a VARCHAR string in the DB (never as ordinal).
 */
public enum PricingRuleType {
    WEEKEND,
    HOLIDAY,
    RUSH_DAY
}