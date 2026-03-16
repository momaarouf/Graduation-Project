package com.travelmarket.backend.tour.dto.request;

import com.travelmarket.backend.tour.enums.RecurrencePattern;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * All fields are optional — only non-null fields are applied.
 * Service layer uses null-checks to do partial updates (patch semantics).
 *
 * Guide cannot set status directly via this request.
 * Status transitions happen through dedicated endpoints:
 *   POST /api/guide/tours/{id}/submit   → PENDING_REVIEW
 *   POST /api/guide/tours/{id}/withdraw → DRAFT
 */
@Data
public class UpdateTourTemplateRequest {

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 255, message = "Location name must not exceed 255 characters")
    private String locationName;

    @Size(max = 100, message = "Region must not exceed 100 characters")
    private String region;

    @Size(max = 5, message = "Country code must not exceed 5 characters")
    private String countryCode;

    @Size(max = 255, message = "Meeting point name must not exceed 255 characters")
    private String meetingPointName;

    @DecimalMin(value = "-90.0",  message = "Invalid latitude")
    @DecimalMax(value = "90.0",   message = "Invalid latitude")
    private BigDecimal meetingLatitude;

    @DecimalMin(value = "-180.0", message = "Invalid longitude")
    @DecimalMax(value = "180.0",  message = "Invalid longitude")
    private BigDecimal meetingLongitude;

    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    private String currency;

    @Min(value = 1, message = "Min capacity must be at least 1")
    private Integer minCapacity;

    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;

    private Boolean instantBook;

    private Boolean isRecurring;

    private RecurrencePattern recurrencePattern;

    private Boolean halalFriendly;

    private Boolean autoCancelIfMinNotMet;

    private Boolean showInPortfolio;
}