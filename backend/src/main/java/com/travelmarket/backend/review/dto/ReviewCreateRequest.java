package com.travelmarket.backend.review.dto;

import jakarta.validation.constraints.*;

/**
 * Request body for POST /api/traveler/reviews
 *
 * The traveler submits this after completing a booking.
 * All four sub-ratings are required — the form has all four visible.
 * Comment is optional.
 *
 * Security note: travelerId is NOT accepted from the client.
 * It is always extracted from the authenticated JWT principal in the service.
 */
public record ReviewCreateRequest(

        /**
         * The completed booking being reviewed.
         * Service will verify:
         *   1. Booking exists
         *   2. Booking belongs to the authenticated traveler
         *   3. Booking status is COMPLETED
         *   4. No review already exists for this booking
         */
        @NotNull(message = "Booking ID is required")
        Long bookingId,

        /**
         * Overall impression — the primary rating used for aggregation.
         * This is the "headline" number shown on guide profiles and tour cards.
         */
        @NotNull(message = "Overall rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer ratingOverall,

        /**
         * Guide Performance — knowledge, communication, punctuality.
         */
        @NotNull(message = "Guide rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer ratingGuide,

        /**
         * Tour Experience — itinerary quality, pacing, locations.
         */
        @NotNull(message = "Tour rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer ratingTour,

        /**
         * Value for Money — price vs. experience delivered.
         */
        @NotNull(message = "Value rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer ratingValue,

        /**
         * Optional free-text comment. Capped at 1000 characters.
         * Null and blank are both treated as "no comment".
         */
        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String comment

) {}