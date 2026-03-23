package com.travelmarket.backend.tour.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Lightweight response for public tour listing cards.
 * Contains only the fields needed to render a card in the browse view.
 * Full detail is fetched separately via PublicTourDetailResponse.
 *
 * Never exposes: internal IDs of guide profile, status, rejection reason,
 * admin fields, meeting coordinates, or raw entity structure.
 */
@Data
public class PublicTourCardResponse {
    private Long id;

    // Content
    private String title;
    private String shortDescription;
    private String category;

    // Location
    private String locationName;
    private String region;
    private String city;
    private String countryCode;

    // Pricing
    private BigDecimal basePrice;
    private String currency;

    // Filter signals
    private Boolean halalFriendly;
    private Boolean instantBook;

    // Guide info shown on card (display name + verified badge)
    private Long guideId;
    private String guideDisplayName;
    private String guideAvatarUrl;
    private Boolean guideVerified;

    // Cover image (lowest displayOrder media item); null if no media uploaded
    private String coverImageUrl;

    // Next upcoming occurrence — null if no future scheduled occurrences
    private Instant nextOccurrenceStartUtc;

    // Reviews — null until review system is implemented
    private BigDecimal averageRating;
    private Integer reviewCount;

    private Integer durationHours;
    private Integer durationMinutes;

    private Boolean isPremium;
    private Boolean isFamilyFriendly;
    private Boolean hasGroupDiscount;
    private Integer groupDiscountThreshold;
    private java.math.BigDecimal groupDiscountPercent;
    private String dynamicPricing;
    private String halalDetails;
}