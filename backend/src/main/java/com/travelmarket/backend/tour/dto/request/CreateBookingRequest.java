package com.travelmarket.backend.tour.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {
    @NotNull(message = "Occurrence ID is required")
    private Long occurrenceId;

    @NotNull(message = "People count is required")
    @Min(value = 1, message = "At least one person is required")
    private Integer peopleCount;

    private String promoCode;

    @NotNull(message = "Waiver must be signed")
    private Boolean waiverSigned;
}
