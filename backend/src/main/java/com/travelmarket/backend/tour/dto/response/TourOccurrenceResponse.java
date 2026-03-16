package com.travelmarket.backend.tour.dto.response;

import lombok.Data;

import java.time.Instant;

@Data
public class TourOccurrenceResponse {
    private Long id;
    private Long templateId;
    private Instant startTimeUtc;
    private Instant endTimeUtc;
    private String status;           // SCHEDULED / FULL / COMPLETED / CANCELLED
    private Integer seatsReserved;
    private Integer maxCapacity;     // copied from template for convenience
    private Integer availableSeats;  // maxCapacity - seatsReserved
    private Instant createdAtUtc;
    private Instant updatedAtUtc;
}