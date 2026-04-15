package com.travelmarket.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Admin request to update a guide's platform fee multiplier.
 *
 * The effective platform fee = {@code app.loyalty.platform-fee-rate} × {@code multiplier}.
 * Example: base 10% × 0.90 = 9% (rewarding a top-performing guide).
 *
 * Constraints:
 *   - Minimum: 0.50 (never charge less than half the base rate)
 *   - Maximum: 1.50 (never charge more than 1.5× the base rate)
 */
@Data
public class UpdateGuideFeeMultiplierRequest {

    /**
     * New fee multiplier value.
     * Must be between 0.50 (50% of base) and 1.50 (150% of base), inclusive.
     */
    @NotNull(message = "multiplier is required")
    @DecimalMin(value = "0.50", message = "Multiplier cannot be lower than 0.50 (50% of base fee)")
    @DecimalMax(value = "1.50", message = "Multiplier cannot exceed 1.50 (150% of base fee)")
    private BigDecimal multiplier;

    /**
     * Optional admin note explaining why the multiplier was changed.
     * Audit-logged but not persisted on the guide profile.
     */
    private String reason;
}
