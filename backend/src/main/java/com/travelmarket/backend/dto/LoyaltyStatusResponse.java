package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Response DTO for {@code GET /api/traveler/loyalty}.
 *
 * Provides all information the frontend needs to render the loyalty panel:
 *   - Current tier and its discount rate
 *   - Progress toward the next tier (trips achieved vs. trips needed)
 *   - Next tier preview (name + its discount rate)
 *
 * All tier thresholds come from {@code LoyaltyProperties} so this response
 * automatically reflects any promotional threshold changes.
 */
@Data
@Builder
public class LoyaltyStatusResponse {

    /** The traveler's current loyalty tier (BRONZE / SILVER / GOLD). */
    private String loyaltyTier;

    /** Discount percentage the traveler earns on each booking at their current tier. */
    private BigDecimal discountPct;

    /** Total number of completed trips the traveler has. */
    private int completedTrips;

    /**
     * Number of additional completed trips needed to reach the next tier.
     * 0 if the traveler is already at GOLD.
     */
    private int tripsToNextTier;

    /**
     * Name of the next tier (SILVER or GOLD).
     * Null if already at GOLD.
     */
    private String nextTier;

    /**
     * Discount percentage the traveler would earn after reaching the next tier.
     * Null if already at GOLD.
     */
    private BigDecimal nextTierDiscountPct;
}
