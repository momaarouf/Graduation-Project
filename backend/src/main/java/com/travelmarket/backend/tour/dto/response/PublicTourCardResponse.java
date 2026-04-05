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
 * admin fields, or raw entity structure.
 *
 * meetingLatitude / meetingLongitude added to support map pin placement
 * on the bounding box and nearby search results. Both are nullable —
 * tours without coordinates are still returned by text-based search.
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

    // Meeting point coordinates — used to place map pins on the listing view.
    // Null if the guide has not set coordinates for this tour.
    private BigDecimal meetingLatitude;
    private BigDecimal meetingLongitude;

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

    // Reviews
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