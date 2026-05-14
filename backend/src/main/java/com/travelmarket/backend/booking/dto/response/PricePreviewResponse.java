package com.travelmarket.backend.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Response DTO for GET /api/public/tours/{id}/occurrences/{occId}/price-preview.
 *
 * Returns a fully-computed price breakdown so the frontend can display
 * transparent, Airbnb-style pricing before the traveler confirms.
 *
 * All monetary amounts are in the tour's currency (e.g. USD).
 * Percentage fields are whole-number percents (e.g. 20 = 20%).
 *
 * The breakdown follows this order (matching PricingService.calculatePrice):
 *   Base Price × quantity
 *   → weekend multiplier  (holiday takes priority if both apply)
 *   → holiday multiplier
 *   → group discount
 *   → loyalty tier discount  (requires auth; 0 for guests)
 *   = Final Price
 *
 * Platform fee is intentionally excluded — travelers never see commission.
 */
@Data
@Builder
public class PricePreviewResponse {

    // ── Input echo ───────────────────────────────────────────────────────────

    /** Per-person base price from the tour template. */
    private BigDecimal basePrice;

    /** Number of travelers in the quote. */
    private int quantity;

    /** ISO-4217 currency code (e.g., "USD"). */
    private String currency;

    // ── Raw subtotal ─────────────────────────────────────────────────────────

    /** basePrice × quantity, before any adjustments. */
    private BigDecimal subtotal;

    // ── Weekend surcharge ────────────────────────────────────────────────────

    /** Whether the selected date falls on a weekend (Sat/Sun). */
    private boolean weekendApplied;

    /**
     * Surcharge percentage as a whole number (e.g., 20 for 20%).
     * 0 when weekendApplied = false.
     */
    private int weekendPercent;

    // ── Holiday surcharge ────────────────────────────────────────────────────

    /** Whether the selected date matches a configured holiday. */
    private boolean holidayApplied;

    /**
     * Surcharge percentage as a whole number (e.g., 25 for 25%).
     * 0 when holidayApplied = false.
     * Note: holiday takes priority over weekend when both apply on the same day.
     */
    private int holidayPercent;

    // ── Dynamic pricing sub-total (after surcharges) ─────────────────────────

    /** Subtotal after weekend/holiday multiplier is applied. */
    private BigDecimal subtotalAfterDynamic;

    // ── Group discount ───────────────────────────────────────────────────────

    /** Whether a group discount was applied (requires hasGroupDiscount + threshold met). */
    private boolean groupDiscountApplied;

    /**
     * Discount percentage as a whole number (e.g., 5 for 5% off).
     * 0 when groupDiscountApplied = false.
     */
    private int groupDiscountPercent;

    /** Absolute amount saved by the group discount. */
    private BigDecimal groupDiscountAmount;

    // ── Loyalty (tier) discount ──────────────────────────────────────────────

    /**
     * Loyalty tier discount percentage (e.g., 5 for Silver, 10 for Gold).
     * 0 for Bronze travelers or unauthenticated guests.
     */
    private int tierDiscountPercent;

    /** Absolute amount saved by the loyalty discount. */
    private BigDecimal tierDiscountAmount;

    // ── Bottom line ──────────────────────────────────────────────────────────

    /**
     * The amount the traveler will be charged.
     * = subtotal → dynamic → group discount → tier discount.
     * Always ≥ 0.
     */
    private BigDecimal finalPrice;
}
