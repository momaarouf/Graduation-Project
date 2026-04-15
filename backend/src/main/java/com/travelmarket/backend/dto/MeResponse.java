package com.travelmarket.backend.dto;

/**
 * Returned by GET /api/auth/me so the frontend knows:
 * - who is logged in and their display name
 * - which dashboard to route to
 * - which profile id to use
 * - whether profile and email are complete (drives onboarding banners)
 * - whether terms have been accepted (needed for new OAuth users)
 */
public record MeResponse(
        Long userId,
        String email,
        String fullName,
        String role,
        Long travelerProfileId,
        Long guideProfileId,
        boolean profileCompleted,
        boolean emailVerified,
        boolean agreedToTerms,
        boolean emailNotificationsEnabled,
        boolean pushNotificationsEnabled
) {}