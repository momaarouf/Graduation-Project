package com.travelmarket.backend.booking.dto.request;

import lombok.Data;

/**
 * Optional request body for DELETE /api/traveler/bookings/{id}.
 *
 * reason is optional — if omitted the service defaults to "Cancelled by Traveler".
 * Stored in booking.cancellation_reason for audit and future dispute reference.
 */
@Data
public class CancelBookingRequest {

    /**
     * Free-text reason provided by the traveler (e.g. "Plans changed").
     * Optional but recommended — feeds future dispute / no-show review cards.
     */
    private String reason;
}