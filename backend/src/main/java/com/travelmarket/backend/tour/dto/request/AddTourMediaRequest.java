package com.travelmarket.backend.tour.dto.request;

import com.travelmarket.backend.tour.enums.TourMediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddTourMediaRequest {
    @NotBlank(message = "URL/Base64 data is required")
    private String url;

    @NotNull(message = "Media type is required")
    private TourMediaType mediaType;

    @NotNull(message = "Display order is required")
    private Integer displayOrder;
}
