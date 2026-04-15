package com.travelmarket.backend.booking.service;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Immutable value object representing a fully broken-down price quote for one booking.
 *
 * Built by {@link PricingService} and consumed by {@link BookingService} to snapshot
 * all discount components onto the {@code Booking} entity at creation time.
 *
 * All monetary amounts are in the booking currency (e.g., USD).
 * All percentage figures are whole-number percents (e.g., 5 = 5%).
 */
@Getter
@Builder
public class PriceBreakdown {

    // ── Input: raw price before any discounts ────────────────────────────────

    /** Base price × peopleCount — the "full price" before any adjustments. */
    private final BigDecimal subtotal;

    // ── Group discount ────────────────────────────────────────────────────────

    /** Percentage of subtotal removed by a group discount (0 if not applicable). */
    private final BigDecimal groupDiscountPct;

    /** Absolute amount removed by the group discount (0 if not applicable). */
    private final BigDecimal groupDiscountAmount;

    // ── Loyalty (tier) discount ───────────────────────────────────────────────

    /** Percentage removed due to traveler's loyalty tier (0 for BRONZE). */
    private final BigDecimal tierDiscountPct;

    /** Absolute dollar amount saved due to loyalty tier (0 for BRONZE). */
    private final BigDecimal tierDiscountAmount;

    // ── Dynamic pricing ───────────────────────────────────────────────────────

    /**
     * Weekend / holiday multiplier applied to the post-discount subtotal.
     * 1.0 means no dynamic adjustment was applied.
     */
    private final BigDecimal dynamicMultiplier;

    // ── Platform fee ─────────────────────────────────────────────────────────

    /**
     * Effective platform fee rate as a percentage (e.g., 9.0 for 9%).
     * = base rate × guide.currentFeeMultiplier.
     */
    private final BigDecimal platformFeeRate;

    /**
     * Absolute platform fee amount taken from final price before guide payout.
     * Stored as a snapshot on the booking for cancellation / payout calculations.
     */
    private final BigDecimal platformFeeAmount;

    // ── Bottom line ───────────────────────────────────────────────────────────

    /** The amount the traveler is actually charged. Always ≥ 0. */
    private final BigDecimal finalPrice;

    /** ISO-4217 currency code (e.g., "USD"). */
    private final String currency;
}
