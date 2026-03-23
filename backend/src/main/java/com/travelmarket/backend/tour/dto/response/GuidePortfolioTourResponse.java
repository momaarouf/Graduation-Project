package com.travelmarket.backend.tour.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * One card in a guide's public portfolio listing.
 * Shows completed work regardless of current template status —
 * a PUBLISHED, PAUSED, or ARCHIVED tour all appear here
 * as long as lastPublishedAtUtc IS NOT NULL and showInPortfolio = true.
 *
 * The status field lets the frontend badge the card:
 * PUBLISHED → "Available to book" + Book Now button
 * PAUSED → "Temporarily unavailable"
 * ARCHIVED → "Past tour"
 */
@Data
public class GuidePortfolioTourResponse {
    private Long id;

    // Content
    private String title;
    private String shortDescription;
    private String category;

    // Location
    private String locationName;
    private String region;
    private String city;

    // Pricing (shown for context; may have changed since last run)
    private BigDecimal basePrice;
    private String currency;

    // Trust signals
    private Boolean halalFriendly;

    // Cover image
    private String coverImageUrl;

    // Track record — proves the guide actually ran this tour
    private Integer completedRunCount; // count of COMPLETED occurrences
    private Integer totalTravelersCount; // sum of seats_reserved across completed runs

    // Reviews — null until review system is implemented
    private Double averageRating;
    private Integer reviewCount;

    // Current availability — lets frontend show "Book Now" or "Past Tour"
    private String status; // PUBLISHED / PAUSED / ARCHIVED
    private Boolean currentlyAvailable; // true only when status = PUBLISHED

    // When the guide last ran this tour
    private Instant lastPublishedAtUtc;
    
    private Boolean isPremium;
    private Boolean isFamilyFriendly;
    private Boolean hasGroupDiscount;
    private Integer groupDiscountThreshold;
    private java.math.BigDecimal groupDiscountPercent;
    private String dynamicPricing;
    private String halalDetails;
}