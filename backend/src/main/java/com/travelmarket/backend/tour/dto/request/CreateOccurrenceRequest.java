package com.travelmarket.backend.tour.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateOccurrenceRequest {

    @NotNull(message = "Start time is required")
    private Instant startTimeUtc;

    @NotNull(message = "End time is required")
    private Instant endTimeUtc;

    // Additional business rules validated in service:
    //   - startTimeUtc must be in the future
    //   - endTimeUtc must be after startTimeUtc
    //   - parent template must be PUBLISHED and not deleted
}