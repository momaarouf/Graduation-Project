package com.travelmarket.backend.review.dto;

import java.time.Instant;

/**
 * Response DTO returned from all review endpoints.
 * Includes engagement fields (helpful votes) and guide replies.
 */
public record ReviewResponse(
        Long id,
        Long bookingId,
        Long tourTemplateId,
        Long occurrenceId,
        Integer ratingOverall,
        Integer ratingGuide,
        Integer ratingTour,
        Integer ratingValue,
        String comment,
        Long travelerId,
        String travelerName,
        String travelerAvatarUrl,
        String travelerTier,
        String tourTitle,
        Instant tourDate,
        String guideReply,
        Instant guideRepliedAt,
        Long helpfulCount,
        boolean isHelpful,
        Instant createdAt
) {}