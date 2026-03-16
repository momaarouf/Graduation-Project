package com.travelmarket.backend.tour.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Full tour data returned to the owning guide.
 * Includes status, rejection reason, and admin-review fields
 * that are never exposed on public endpoints.
 */
@Data
public class TourTemplateResponse {
    private Long id;

    // Core content
    private String title;
    private String description;
    private String shortDescription;
    private String category;

    // Location
    private String locationName;
    private String region;
    private String countryCode;
    private String meetingPointName;
    private BigDecimal meetingLatitude;
    private BigDecimal meetingLongitude;

    // Pricing & capacity
    private BigDecimal basePrice;
    private String currency;
    private Integer minCapacity;
    private Integer maxCapacity;

    // Booking behaviour
    private Boolean instantBook;
    private Boolean isRecurring;
    private String recurrencePattern;

    // Trust signals
    private Boolean halalFriendly;

    // Status — guide sees full lifecycle including PENDING_REVIEW / REJECTED
    private String status;
    private Boolean isActive;

    // Admin review feedback — only populated when status = REJECTED
    private String rejectionReason;

    // Portfolio settings
    private Boolean showInPortfolio;
    private Boolean autoCancelIfMinNotMet;

    // Media (ordered by displayOrder)
    private List<TourMediaResponse> media;

    // Timestamps
    private Instant createdAtUtc;
    private Instant updatedAtUtc;
    private Instant lastPublishedAtUtc;
}