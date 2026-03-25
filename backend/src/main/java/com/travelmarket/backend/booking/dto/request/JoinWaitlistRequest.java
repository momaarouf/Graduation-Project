package com.travelmarket.backend.booking.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/traveler/waitlist.
 *
 * Traveler specifies which full occurrence they want to be queued for.
 * The service validates the occurrence is genuinely full before creating
 * the waitlist entry.
 */
@Data
public class JoinWaitlistRequest {

    /** The occurrence the traveler wants to wait for. */
    @NotNull(message = "Occurrence ID is required")
    private Long occurrenceId;

    /** Number of seats to wait for. Must be at least 1. */
    @NotNull(message = "People count is required")
    @Min(value = 1, message = "At least one person is required")
    private Integer peopleCount;
}