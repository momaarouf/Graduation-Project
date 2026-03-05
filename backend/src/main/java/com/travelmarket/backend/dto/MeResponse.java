package com.travelmarket.backend.dto;

/**
 * Returned by GET /api/auth/me so the frontend knows:
 * - who is logged in
 * - which dashboard to route to
 * - which profile id to use
 */
public record MeResponse(
        Long userId,
        String email,
        String role,
        Long travelerProfileId,
        Long guideProfileId
) {}