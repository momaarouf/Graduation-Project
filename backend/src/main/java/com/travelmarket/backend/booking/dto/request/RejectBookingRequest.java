package com.travelmarket.backend.booking.dto.request;

import lombok.Data;

/**
 * Optional request body for PUT /api/guide/bookings/{id}/reject.
 *
 * reason is optional — if omitted the service defaults to "Rejected by Guide".
 * A meaningful reason improves traveler trust and is required by future
 * notification and dispute cards.
 */
@Data
public class RejectBookingRequest {

    /**
     * Guide's explanation for rejecting the request
     * (e.g. "Date conflict with private group", "Capacity constraint").
     * Optional but strongly recommended for traveler UX.
     */
    private String reason;
}