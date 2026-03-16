package com.travelmarket.backend.tour.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Full detail response for the public tour detail page.
 * Extends the card fields with description, meeting point,
 * capacity, full media gallery, and upcoming occurrences.
 *
 * Never exposes: status, rejection reason, admin fields,
 * guide profile internals, or raw entity structure.
 */
@Data
public class PublicTourDetailResponse {
    private Long id;

    // Content
    private String title;
    private String description;
    private String shortDescription;
    private String category;

    // Location
    private String locationName;
    private String region;
    private String countryCode;

    // Meeting point (shown after booking in full; shown here for awareness)
    private String meetingPointName;
    private BigDecimal meetingLatitude;
    private BigDecimal meetingLongitude;

    // Pricing
    private BigDecimal basePrice;
    private String currency;

    // Capacity
    private Integer minCapacity;
    private Integer maxCapacity;

    // Booking behaviour
    private Boolean instantBook;
    private Boolean isRecurring;
    private String recurrencePattern;

    // Trust signals
    private Boolean halalFriendly;

    // Guide info
    private Long guideId;
    private String guideDisplayName;
    private Boolean guideVerified;

    // Full ordered media gallery (cover first by displayOrder)
    private List<TourMediaResponse> media;

    // Future active occurrences (SCHEDULED or FULL, start > now)
    private List<TourOccurrenceResponse> occurrences;

    // Reviews — null until review system is implemented
    private Double averageRating;
    private Integer reviewCount;
}