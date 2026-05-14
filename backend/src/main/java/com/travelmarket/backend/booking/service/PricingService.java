package com.travelmarket.backend.booking.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelmarket.backend.booking.dto.response.PricePreviewResponse;
import com.travelmarket.backend.booking.enums.LoyaltyTier;
import com.travelmarket.backend.config.LoyaltyProperties;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Central service that owns ALL pricing logic for bookings.
 *
 * ── Responsibilities ─────────────────────────────────────────────────────────
 * 1. {@link #calculatePrice} — computes the full price breakdown for one booking:
 *       subtotal → group discount → loyalty discount → dynamic multiplier → final price
 *       + platform fee based on base rate × guide multiplier.
 *
 * 2. {@link #recalculateLoyaltyTier} — updates a traveler's tier based on their
 *       current {@code totalCompletedTrips} count and the configured thresholds.
 *
 * 3. {@link #effectivePlatformFeeRate} — returns the actual commission rate for a guide.
 *
 * ── Design rules ─────────────────────────────────────────────────────────────
 * - NO business numbers are hardcoded here.  All thresholds and percentages come
 *   from {@link LoyaltyProperties}, which is bound from {@code application.properties}.
 * - All calculations use {@link BigDecimal} with {@link RoundingMode#HALF_UP} to
 *   avoid floating-point drift on financial amounts.
 * - This service is PURE logic — it does NOT persist anything. Callers (BookingService)
 *   are responsible for saving the results.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PricingService {

    private final LoyaltyProperties loyalty;
    private final ObjectMapper objectMapper;
    // Needed only for recalculateLoyaltyTier — we persist via BookingService, not here.
    // Injected for tier-determination convenience (reads completedTrips).
    private final TravelerProfileRepository travelerProfileRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Builds a {@link PriceBreakdown} for a proposed booking.
     *
     * Evaluation order (each step applies to the result of the previous):
     *   1. Subtotal  = basePrice × peopleCount
     *   2. Group discount (if template has group discount enabled and group is large enough)
     *   3. Loyalty discount (based on traveler's current tier)
     *   4. Dynamic pricing multiplier (weekend / holiday from template JSON)
     *   5. Platform fee = finalPrice × effectivePlatformFeeRate(guide)
     *
     * @param template    the tour template (provides base price, discounts, dynamic config)
     * @param occurrence  the specific occurrence being booked (provides start time for dynamic pricing)
     * @param traveler    the traveler making the booking (provides loyalty tier)
     * @param peopleCount number of seats being reserved
     * @return fully computed {@link PriceBreakdown}
     */
    public PriceBreakdown calculatePrice(TourTemplate template,
                                         TourOccurrence occurrence,
                                         TravelerProfile traveler,
                                         int peopleCount) {

        // ── Step 1: Subtotal ─────────────────────────────────────────────────
        BigDecimal basePrice = template.getBasePrice() != null
                ? template.getBasePrice()
                : BigDecimal.ZERO;
        BigDecimal subtotal = basePrice.multiply(BigDecimal.valueOf(peopleCount));

        String currency = template.getCurrency() != null ? template.getCurrency() : "USD";

        BigDecimal workingPrice = subtotal;

        // ── Step 2: Group discount ───────────────────────────────────────────
        BigDecimal groupDiscountPct = BigDecimal.ZERO;
        BigDecimal groupDiscountAmount = BigDecimal.ZERO;

        if (Boolean.TRUE.equals(template.getHasGroupDiscount())
                && template.getGroupDiscountThreshold() != null
                && peopleCount >= template.getGroupDiscountThreshold()) {

            groupDiscountPct = template.getGroupDiscountPercent() != null
                    ? template.getGroupDiscountPercent()
                    : BigDecimal.ZERO;

            if (groupDiscountPct.compareTo(BigDecimal.ZERO) > 0) {
                groupDiscountAmount = subtotal
                        .multiply(groupDiscountPct.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                workingPrice = subtotal.subtract(groupDiscountAmount);
                log.debug("[Pricing] Group discount {}% applied: -{}", groupDiscountPct, groupDiscountAmount);
            }
        }

        // ── Step 3: Loyalty (tier) discount ──────────────────────────────────
        LoyaltyTier tier = traveler.getLoyaltyTier() != null ? traveler.getLoyaltyTier() : LoyaltyTier.BRONZE;
        BigDecimal tierDiscountPct = getTierDiscountPct(tier);
        BigDecimal tierDiscountAmount = BigDecimal.ZERO;

        if (tierDiscountPct.compareTo(BigDecimal.ZERO) > 0) {
            // Loyalty discount is applied to the post-group-discount price
            tierDiscountAmount = workingPrice
                    .multiply(tierDiscountPct.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            workingPrice = workingPrice.subtract(tierDiscountAmount);
            log.debug("[Pricing] Loyalty tier {} discount {}% applied: -{}",
                    tier, tierDiscountPct, tierDiscountAmount);
        }

        // ── Step 4: Dynamic pricing (weekend / holiday multiplier) ───────────
        BigDecimal dynamicMultiplier = BigDecimal.ONE;
        BigDecimal priceAfterDynamic = applyDynamicPricing(workingPrice, template, occurrence.getStartTimeUtc());
        if (workingPrice.compareTo(BigDecimal.ZERO) != 0) {
            dynamicMultiplier = priceAfterDynamic.divide(workingPrice, 4, RoundingMode.HALF_UP);
        }
        workingPrice = priceAfterDynamic;

        // ── Step 5: Platform fee ─────────────────────────────────────────────
        // Effective rate = base rate × guide's individual multiplier.
        // Guide multiplier defaults to 1.0 (no adjustment) when not set.
        GuideProfile guide = occurrence.getTemplate().getGuide();
        BigDecimal platformFeeRate = effectivePlatformFeeRate(guide);
        BigDecimal platformFeeAmount = workingPrice
                .multiply(platformFeeRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));

        // ── Step 6: Final price (must never be negative) ─────────────────────
        BigDecimal finalPrice = workingPrice.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        platformFeeAmount = platformFeeAmount.setScale(2, RoundingMode.HALF_UP);

        log.debug("[Pricing] Booking breakdown — subtotal={} groupDisc={} tierDisc={} " +
                        "dynamicMult={} platformFee={} FINAL={}",
                subtotal, groupDiscountAmount, tierDiscountAmount,
                dynamicMultiplier, platformFeeAmount, finalPrice);

        return PriceBreakdown.builder()
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .groupDiscountPct(groupDiscountPct)
                .groupDiscountAmount(groupDiscountAmount.setScale(2, RoundingMode.HALF_UP))
                .tierDiscountPct(tierDiscountPct)
                .tierDiscountAmount(tierDiscountAmount.setScale(2, RoundingMode.HALF_UP))
                .dynamicMultiplier(dynamicMultiplier.setScale(4, RoundingMode.HALF_UP))
                .platformFeeRate(platformFeeRate)
                .platformFeeAmount(platformFeeAmount)
                .finalPrice(finalPrice)
                .currency(currency)
                .build();
    }

    /**
     * Recalculates and updates a traveler's loyalty tier based on their current
     * {@code totalCompletedTrips} count vs the configured thresholds.
     *
     * Rules (using {@code LoyaltyProperties} values):
     *   trips >= goldMinTrips  → GOLD
     *   trips >= silverMinTrips → SILVER
     *   otherwise              → BRONZE
     *
     * The traveler entity is mutated in-place (not saved — caller persists it).
     *
     * @param traveler the traveler whose tier may need to be updated
     * @return the (potentially new) tier that was set on the traveler
     */
    public LoyaltyTier recalculateLoyaltyTier(TravelerProfile traveler) {
        int trips = traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0;

        LoyaltyTier newTier;
        if (trips >= loyalty.getGoldMinTrips()) {
            newTier = LoyaltyTier.GOLD;
        } else if (trips >= loyalty.getSilverMinTrips()) {
            newTier = LoyaltyTier.SILVER;
        } else {
            newTier = LoyaltyTier.BRONZE;
        }

        LoyaltyTier oldTier = traveler.getLoyaltyTier();
        if (oldTier != newTier) {
            traveler.setLoyaltyTier(newTier);
            log.info("[Loyalty] Traveler {} tier updated: {} → {} (trips: {})",
                    traveler.getId(), oldTier, newTier, trips);
        }

        return newTier;
    }

    /**
     * Returns the effective platform fee rate (as a percentage) for a given guide.
     *
     * Effective rate = {@code app.loyalty.platform-fee-rate} × {@code guide.currentFeeMultiplier}
     *
     * Example:
     *   base rate = 10%, multiplier = 0.90 (top guide reward) → effective = 9%
     *   base rate = 10%, multiplier = 1.10 (underperforming)  → effective = 11%
     *
     * @param guide the guide profile (may be null — falls back to base rate)
     * @return effective platform fee rate percentage (non-negative)
     */
    public BigDecimal effectivePlatformFeeRate(GuideProfile guide) {
        BigDecimal baseRate = loyalty.getPlatformFeeRate();

        if (guide == null) return baseRate;

        // Default multiplier for new guides is 1.0 (neutral — no adjustment)
        BigDecimal multiplier = guide.getCurrentFeeMultiplier() != null
                ? guide.getCurrentFeeMultiplier()
                : BigDecimal.ONE;

        // Clamp to a sane range [0.5, 1.5] as a safety rail — admin UI enforces this too
        multiplier = multiplier.max(new BigDecimal("0.5")).min(new BigDecimal("1.5"));

        return baseRate.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Tier discount helpers ─────────────────────────────────────────────────

    /**
     * Returns the booking discount percentage for the given loyalty tier.
     * All values come from {@link LoyaltyProperties} — nothing hardcoded.
     */
    public BigDecimal getTierDiscountPct(LoyaltyTier tier) {
        if (tier == null) return BigDecimal.ZERO;
        return switch (tier) {
            case GOLD   -> loyalty.getGoldDiscountPct();
            case SILVER -> loyalty.getSilverDiscountPct();
            default     -> loyalty.getBronzeDiscountPct(); // BRONZE and any future additions
        };
    }

    /**
     * Returns how many trips until the next tier, for use in UI progress indicators.
     * Returns 0 if already at GOLD (highest tier).
     *
     * @param traveler the traveler profile
     * @return number of additional trips needed to reach the next tier
     */
    public int tripsToNextTier(TravelerProfile traveler) {
        int trips = traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0;
        LoyaltyTier tier = traveler.getLoyaltyTier() != null ? traveler.getLoyaltyTier() : LoyaltyTier.BRONZE;

        return switch (tier) {
            case BRONZE -> Math.max(0, loyalty.getSilverMinTrips() - trips);
            case SILVER -> Math.max(0, loyalty.getGoldMinTrips() - trips);
            case GOLD   -> 0; // already at top tier
        };
    }

    /**
     * Returns the tier the traveler will reach next (null if already GOLD).
     */
    public LoyaltyTier nextTier(LoyaltyTier current) {
        if (current == null || current == LoyaltyTier.BRONZE) return LoyaltyTier.SILVER;
        if (current == LoyaltyTier.SILVER) return LoyaltyTier.GOLD;
        return null; // GOLD is the top tier
    }

    // ── Price preview (unauthenticated — guest-friendly) ──────────────────────

    /**
     * Computes a {@link PricePreviewResponse} for the booking widget on the
     * public tour detail page.  No authentication is required — traveler may be null.
     *
     * Breakdown order:
     *   1. subtotal = basePrice × peopleCount
     *   2. Holiday surcharge (takes priority over weekend if both apply)
     *   3. Weekend surcharge
     *   4. Group discount (if template has group discount and threshold is met)
     *   5. Loyalty tier discount (0 for guests / BRONZE travelers)
     *
     * Platform fee is intentionally omitted — traveler-facing totals never show commission.
     *
     * @param template    the tour being quoted (provides pricing config)
     * @param tourDate    the start time of the selected occurrence (UTC)
     * @param peopleCount number of seats being priced
     * @param traveler    optional — null for guests (no loyalty discount applied)
     * @return fully-computed {@link PricePreviewResponse}
     */
    public PricePreviewResponse previewPrice(TourTemplate template,
                                             Instant tourDate,
                                             int peopleCount,
                                             TravelerProfile traveler) {
        BigDecimal basePrice = template.getBasePrice() != null
                ? template.getBasePrice() : BigDecimal.ZERO;
        String currency = template.getCurrency() != null ? template.getCurrency() : "USD";

        // Step 1 — Raw subtotal
        BigDecimal subtotal = basePrice.multiply(BigDecimal.valueOf(peopleCount));
        BigDecimal workingPrice = subtotal;

        // Step 2 — Detect dynamic pricing (holiday takes priority over weekend)
        DynamicPricingResult dynamic = parseDynamicPricing(template, tourDate);

        if (dynamic.holidayApplied()) {
            workingPrice = subtotal.multiply(BigDecimal.valueOf(dynamic.safeHolidayMultiplier()));
        } else if (dynamic.weekendApplied()) {
            workingPrice = subtotal.multiply(BigDecimal.valueOf(dynamic.safeWeekendMultiplier()));
        }

        BigDecimal subtotalAfterDynamic = workingPrice.setScale(2, RoundingMode.HALF_UP);

        // Step 3 — Group discount
        boolean groupApplied = Boolean.TRUE.equals(template.getHasGroupDiscount())
                && template.getGroupDiscountThreshold() != null
                && peopleCount >= template.getGroupDiscountThreshold()
                && template.getGroupDiscountPercent() != null
                && template.getGroupDiscountPercent().compareTo(BigDecimal.ZERO) > 0;

        BigDecimal groupDiscountPct = groupApplied ? template.getGroupDiscountPercent() : BigDecimal.ZERO;
        BigDecimal groupDiscountAmount = BigDecimal.ZERO;

        if (groupApplied) {
            groupDiscountAmount = subtotalAfterDynamic
                    .multiply(groupDiscountPct.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            workingPrice = subtotalAfterDynamic.subtract(groupDiscountAmount);
        } else {
            workingPrice = subtotalAfterDynamic;
        }

        // Step 4 — Loyalty tier discount (0 for guests)
        LoyaltyTier tier = (traveler != null && traveler.getLoyaltyTier() != null)
                ? traveler.getLoyaltyTier() : LoyaltyTier.BRONZE;
        BigDecimal tierDiscountPct = getTierDiscountPct(tier);
        BigDecimal tierDiscountAmount = BigDecimal.ZERO;

        if (tierDiscountPct.compareTo(BigDecimal.ZERO) > 0) {
            tierDiscountAmount = workingPrice
                    .multiply(tierDiscountPct.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
            workingPrice = workingPrice.subtract(tierDiscountAmount);
        }

        BigDecimal finalPrice = workingPrice.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        log.debug("[Preview] tour={} date={} qty={} subtotal={} weekend={}% holiday={}% " +
                        "group={}% tier={}% FINAL={}",
                template.getId(), tourDate, peopleCount, subtotal,
                dynamic.weekendPercent(), dynamic.holidayPercent(),
                groupDiscountPct.intValue(), tierDiscountPct.intValue(), finalPrice);

        return PricePreviewResponse.builder()
                .basePrice(basePrice)
                .quantity(peopleCount)
                .currency(currency)
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .weekendApplied(dynamic.weekendApplied())
                .weekendPercent(dynamic.weekendPercent())
                .holidayApplied(dynamic.holidayApplied())
                .holidayPercent(dynamic.holidayPercent())
                .subtotalAfterDynamic(subtotalAfterDynamic)
                .groupDiscountApplied(groupApplied)
                .groupDiscountPercent(groupDiscountPct.intValue())
                .groupDiscountAmount(groupDiscountAmount.setScale(2, RoundingMode.HALF_UP))
                .tierDiscountPercent(tierDiscountPct.intValue())
                .tierDiscountAmount(tierDiscountAmount.setScale(2, RoundingMode.HALF_UP))
                .finalPrice(finalPrice)
                .build();
    }

    // ── Dynamic pricing helpers ───────────────────────────────────────────────

    /**
     * Result of evaluating the template's dynamic pricing JSON for a specific date.
     *
     * Only one of weekendApplied / holidayApplied will be true at a time
     * (holiday takes priority). Both are false when no dynamic pricing is configured
     * or neither condition applies for the given date.
     */
    private record DynamicPricingResult(
            boolean weekendApplied,
            double  rawWeekendMultiplier,   // 1.0 when not applied
            boolean holidayApplied,
            double  rawHolidayMultiplier    // 1.0 when not applied
    ) {
        /** Weekend multiplier capped at 5.0. */
        double safeWeekendMultiplier() { return Math.min(rawWeekendMultiplier, 5.0); }

        /** Holiday multiplier capped at 5.0. */
        double safeHolidayMultiplier() { return Math.min(rawHolidayMultiplier, 5.0); }

        /**
         * Weekend surcharge as a whole-number percent (e.g. 20 for +20%).
         * 0 when weekendApplied = false.
         */
        int weekendPercent() {
            if (!weekendApplied) return 0;
            return (int) Math.round((safeWeekendMultiplier() - 1.0) * 100);
        }

        /**
         * Holiday surcharge as a whole-number percent (e.g. 25 for +25%).
         * 0 when holidayApplied = false.
         */
        int holidayPercent() {
            if (!holidayApplied) return 0;
            return (int) Math.round((safeHolidayMultiplier() - 1.0) * 100);
        }
    }

    /**
     * Parses the template's dynamic pricing JSON and evaluates which rule applies
     * for the given tour date.  Returns a result object that callers can inspect
     * without re-parsing JSON.
     *
     * JSON shape (stored in {@code TourTemplate.dynamicPricing}):
     * <pre>
     * {
     *   "weekendMultiplier": 1.2,
     *   "holidayMultiplier": 1.5
     * }
     * </pre>
     *
     * Legacy support: values > 5 are treated as percent (e.g. 120 → 1.20).
     * Multipliers are capped at 5.0 as a safety rail.
     * Holiday takes priority over weekend when both apply on the same date.
     */
    private DynamicPricingResult parseDynamicPricing(TourTemplate template, Instant tourDate) {
        String json = template.getDynamicPricing();
        // No-op result when no dynamic pricing configured
        DynamicPricingResult none = new DynamicPricingResult(false, 1.0, false, 1.0);
        if (json == null || json.isEmpty()) return none;

        try {
            JsonNode root = objectMapper.readTree(json);
            double weekendMultiplier = root.path("weekendMultiplier").asDouble(1.0);
            double holidayMultiplier = root.path("holidayMultiplier").asDouble(1.0);

            // Legacy compatibility: if sent as percent (e.g. 120), convert to multiplier (1.20)
            if (weekendMultiplier > 5.0) weekendMultiplier /= 100.0;
            if (holidayMultiplier > 5.0) holidayMultiplier /= 100.0;

            ZonedDateTime zdt = tourDate.atZone(ZoneId.of("UTC"));
            DayOfWeek dow = zdt.getDayOfWeek();
            int month = zdt.getMonthValue();
            int day   = zdt.getDayOfMonth();

            // Holiday takes priority over weekend
            if (isFixedLebaneseHoliday(month, day) && holidayMultiplier != 1.0) {
                return new DynamicPricingResult(false, 1.0, true, holidayMultiplier);
            }

            if ((dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) && weekendMultiplier != 1.0) {
                return new DynamicPricingResult(true, weekendMultiplier, false, 1.0);
            }

        } catch (Exception e) {
            log.warn("[Pricing] Failed to parse dynamic pricing JSON for template {}: {}",
                    template.getId(), e.getMessage());
        }

        return none;
    }

    /**
     * Applies the dynamic pricing result to a price (used by calculatePrice).
     * Delegates to parseDynamicPricing to avoid duplicating JSON parsing logic.
     */
    private BigDecimal applyDynamicPricing(BigDecimal price, TourTemplate template, Instant tourDate) {
        DynamicPricingResult result = parseDynamicPricing(template, tourDate);
        if (result.holidayApplied()) {
            return price.multiply(BigDecimal.valueOf(result.safeHolidayMultiplier()));
        }
        if (result.weekendApplied()) {
            return price.multiply(BigDecimal.valueOf(result.safeWeekendMultiplier()));
        }
        return price;
    }

    /** Lebanese public holidays (fixed dates). */
    private boolean isFixedLebaneseHoliday(int month, int day) {
        if (month == 1  && day == 1)  return true;  // New Year
        if (month == 1  && day == 6)  return true;  // Armenian Christmas
        if (month == 2  && day == 9)  return true;  // St Maron
        if (month == 3  && day == 25) return true;  // Annunciation
        if (month == 5  && day == 1)  return true;  // Labour Day
        if (month == 5  && day == 25) return true;  // Resistance & Liberation
        if (month == 8  && day == 15) return true;  // Assumption
        if (month == 11 && day == 1)  return true;  // All Saints
        if (month == 11 && day == 22) return true;  // Independence Day
        if (month == 12 && day == 25) return true;  // Christmas
        return false;
    }
}
