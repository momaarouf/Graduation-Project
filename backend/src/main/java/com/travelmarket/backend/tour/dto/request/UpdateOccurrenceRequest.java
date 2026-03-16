package com.travelmarket.backend.tour.dto.request;

import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import lombok.Data;

import java.time.Instant;

/**
 * All fields optional — null fields are not applied.
 *
 * Guide can update time and status.
 * Allowed status transitions via this endpoint:
 *   SCHEDULED → CANCELLED  (guide cancels an occurrence)
 *   SCHEDULED → COMPLETED  (guide marks a run as done)
 *
 * FULL is set automatically by booking logic, not by the guide directly.
 */
@Data
public class UpdateOccurrenceRequest {

    private Instant startTimeUtc;

    private Instant endTimeUtc;

    // Guide can cancel or mark complete; booking logic sets FULL automatically
    private TourOccurrenceStatus status;
}