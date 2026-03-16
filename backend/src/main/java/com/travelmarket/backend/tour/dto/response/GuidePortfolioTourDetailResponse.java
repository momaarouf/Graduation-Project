package com.travelmarket.backend.tour.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Full portfolio detail for one of a guide's past or active tours.
 * Shown on the guide's public profile when a visitor clicks a portfolio card.
 *
 * Designed to function as a professional case-study page:
 *   - Full description and media gallery
 *   - Aggregate track record (total runs, total travelers, avg rating)
 *   - Individual run history with date, duration, and attendee count
 *   - "Book Now" signal if the tour is currently available
 *
 * If relatedPublishedTourId is non-null, the frontend can show a
 * "Book this tour" button pointing to the active published version.
 */
@Data
public class GuidePortfolioTourDetailResponse {

    private Long id;

    // Guide info (for breadcrumb and back-link)
    private Long guideId;
    private String guideDisplayName;
    private Boolean guideVerified;

    // Content
    private String title;
    private String description;
    private String shortDescription;
    private String category;

    // Location
    private String locationName;
    private String region;
    private String countryCode;
    private String meetingPointName;

    // Pricing
    private BigDecimal basePrice;
    private String currency;

    // Capacity
    private Integer minCapacity;
    private Integer maxCapacity;

    // Trust signals
    private Boolean halalFriendly;
    private Boolean instantBook;

    // Full ordered media gallery (cover first)
    private List<TourMediaResponse> media;

    // Aggregate track record
    private Integer completedRunCount;     // count of COMPLETED occurrences
    private Integer totalTravelersCount;   // sum of seats_reserved across completed runs
    private Double averageRating;          // null until reviews are implemented
    private Integer reviewCount;           // null until reviews are implemented

    // Individual run history — ordered newest first
    private List<CompletedRunSummary> completedRuns;

    // Current availability
    private String status;                 // PUBLISHED / PAUSED / ARCHIVED
    private Boolean currentlyAvailable;  // true only when status = PUBLISHED

    // If the guide currently has a live version of this tour,
    // this points to it so the frontend can show "Book Now"
    private Long relatedPublishedTourId;

    private Instant lastPublishedAtUtc;

    /**
     * One completed run shown in the run history table.
     * Gives the visitor proof of real, repeated delivery.
     */
    @Data
    public static class CompletedRunSummary {
        private Long occurrenceId;
        private Instant startTimeUtc;
        private Instant endTimeUtc;
        private Integer attendeeCount;   // seats_reserved at time of completion
        // Duration in hours is computed by the frontend from start/end
    }
}