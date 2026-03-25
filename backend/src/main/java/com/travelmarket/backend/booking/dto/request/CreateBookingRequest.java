package com.travelmarket.backend.booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/traveler/bookings.
 *
 * promoCode is optional — full validation (expiry, usage cap, guide scope)
 * is handled in BookingService. Promo discount math will be completed in
 * the payment card; the code is accepted and snapshotted here.
 */
@Data
public class CreateBookingRequest {

    /** The occurrence the traveler wants to book. Must be SCHEDULED and not full. */
    @NotNull(message = "Occurrence ID is required")
    private Long occurrenceId;

    /** Number of seats to reserve. Must be at least 1. */
    @NotNull(message = "People count is required")
    @Min(value = 1, message = "At least one person is required")
    private Integer peopleCount;

    /**
     * Optional promo code string.
     * Looked up against promo_codes table; discount snapshotted if valid.
     * Full promo enforcement (guide-scoped, expiry, max uses) lives in BookingService.
     */
    private String promoCode;

    /**
     * Traveler must explicitly confirm they have read and accepted the
     * waiver / liability terms before a booking is created.
     */
    @NotNull(message = "Waiver acknowledgement is required")
    private Boolean waiverSigned;
}