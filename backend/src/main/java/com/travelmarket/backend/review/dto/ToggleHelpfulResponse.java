package com.travelmarket.backend.review.dto;

/**
 * Result of a helpful toggle operation.
 * Frontend uses this to sync the highlighted state and absolute count.
 */
public record ToggleHelpfulResponse(
        long helpfulCount,
        boolean isHelpful
) {}
