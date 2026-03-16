package com.travelmarket.backend.tour.dto.request;

import com.travelmarket.backend.tour.enums.RecurrencePattern;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateTourTemplateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @Size(max = 255, message = "Location name must not exceed 255 characters")
    private String locationName;

    @Size(max = 100, message = "Region must not exceed 100 characters")
    private String region;

    // ISO 3166-1 alpha-2; defaults to LB if omitted
    @Size(max = 5, message = "Country code must not exceed 5 characters")
    private String countryCode = "LB";

    @Size(max = 255, message = "Meeting point name must not exceed 255 characters")
    private String meetingPointName;

    @DecimalMin(value = "-90.0", message = "Invalid latitude")
    @DecimalMax(value = "90.0",  message = "Invalid latitude")
    private BigDecimal meetingLatitude;

    @DecimalMin(value = "-180.0", message = "Invalid longitude")
    @DecimalMax(value = "180.0",  message = "Invalid longitude")
    private BigDecimal meetingLongitude;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.01", message = "Base price must be greater than 0")
    private BigDecimal basePrice;

    // Defaults to USD if omitted
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
    private String currency = "USD";

    @NotNull(message = "Min capacity is required")
    @Min(value = 1, message = "Min capacity must be at least 1")
    private Integer minCapacity;

    @NotNull(message = "Max capacity is required")
    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;

    private Boolean instantBook = false;

    private Boolean isRecurring = false;

    private RecurrencePattern recurrencePattern = RecurrencePattern.NONE;

    private Boolean halalFriendly = false;

    // Guide can disable the 48h auto-cancel safety net per tour
    private Boolean autoCancelIfMinNotMet = true;

    // Guide can opt out of portfolio visibility on creation
    private Boolean showInPortfolio = true;

    // Guide creates tours as DRAFT only.
    // Ignored if the client sends PUBLISHED — service enforces DRAFT on create.
    private TourTemplateStatus status = TourTemplateStatus.DRAFT;
}