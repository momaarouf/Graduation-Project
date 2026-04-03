package com.travelmarket.backend.review.dto;

import java.time.Instant;

/**
 * Response DTO returned from all review endpoints.
 *
 * Safe by design — no email, no phone, no sensitive traveler data.
 * Only the traveler's display name and avatar are exposed publicly.
 *
 * tourDate is the occurrence's startTimeUtc (when the tour actually happened),
 * not createdAt (when the review was written). This is what the frontend
 * ReviewDetail.tourDate field expects.
 */
public record ReviewResponse(

        Long id,
        Long bookingId,
        Long tourTemplateId,
        Long occurrenceId,

        // ── Four sub-ratings ─────────────────────────────────────────────
        Integer ratingOverall,
        Integer ratingGuide,
        Integer ratingTour,
        Integer ratingValue,

        // ── Review content ────────────────────────────────────────────────
        String comment,

        // ── Safe traveler info (no PII) ───────────────────────────────────
        Long travelerId,
        String travelerName,
        String travelerAvatarUrl,

        // ── Tour context (useful for "My Reviews" list) ───────────────────
        String tourTitle,

        /**
         * When the tour actually happened (occurrence startTimeUtc).
         * Maps to ReviewDetail.tourDate on the frontend.
         */
        Instant tourDate,

        // ── Guide reply (null until guide responds) ───────────────────────
        String guideReply,
        Instant guideRepliedAt,

        // ── Timestamps ───────────────────────────────────────────────────
        Instant createdAt

) {}