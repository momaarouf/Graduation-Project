package com.travelmarket.backend.dto;

import java.time.Instant;

public record VerifiedGuideAdminResponse(
        Long guideProfileId,
        Long userId,
        String email,
        String fullName,
        String baseCountry,
        String baseCity,
        Instant verifiedAtUtc,
        Instant verificationSubmittedAtUtc
) {}