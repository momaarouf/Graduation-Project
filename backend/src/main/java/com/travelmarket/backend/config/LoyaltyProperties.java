package com.travelmarket.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Externalized loyalty-tier configuration.
 *
 * All business thresholds and discount percentages are read from
 * {@code application.properties} via the {@code app.loyalty.*} prefix.
 * This means tier rules can be tuned for a new season (e.g., lowering
 * the Silver threshold during a promotional period) without changing Java code.
 *
 * Defaults are set to reasonable production values in case the properties
 * file is missing specific keys, so the system degrades gracefully.
 *
 * Bound values:
 * <pre>
 *   app.loyalty.silver-min-trips    = 5   (trips needed to reach SILVER)
 *   app.loyalty.gold-min-trips      = 10  (trips needed to reach GOLD)
 *   app.loyalty.bronze-discount-pct = 0   (% discount for BRONZE — typically 0)
 *   app.loyalty.silver-discount-pct = 5   (% discount for SILVER bookings)
 *   app.loyalty.gold-discount-pct   = 10  (% discount for GOLD bookings)
 *
 *   app.loyalty.platform-fee-rate   = 10  (base platform commission %)
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "app.loyalty")
@Getter
@Setter
public class LoyaltyProperties {

    // ── Tier thresholds (completed trips) ────────────────────────────────────

    /** Minimum completed trips required to hold the SILVER tier. Default: 5. */
    private int silverMinTrips = 5;

    /** Minimum completed trips required to hold the GOLD tier. Default: 10. */
    private int goldMinTrips = 10;

    // ── Tier discount percentages ─────────────────────────────────────────────

    /** Booking discount percentage applied to BRONZE travelers. Default: 0 (no discount). */
    private BigDecimal bronzeDiscountPct = BigDecimal.ZERO;

    /** Booking discount percentage applied to SILVER travelers. Default: 5%. */
    private BigDecimal silverDiscountPct = new BigDecimal("5");

    /** Booking discount percentage applied to GOLD travelers. Default: 10%. */
    private BigDecimal goldDiscountPct = new BigDecimal("10");

    // ── Platform fee ─────────────────────────────────────────────────────────

    /**
     * Base platform commission rate as a whole-number percentage.
     * This rate is multiplied by the guide's {@code currentFeeMultiplier}
     * to produce the effective per-booking fee.
     *
     * Example: base = 10, guide multiplier = 0.90 → effective fee = 9%.
     * Default: 10%.
     */
    private BigDecimal platformFeeRate = new BigDecimal("10");
}
