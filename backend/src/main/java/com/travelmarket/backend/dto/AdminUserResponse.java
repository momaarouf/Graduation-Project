package com.travelmarket.backend.dto;

import java.time.Instant;

/**
 * Admin view of a user. Never expose passwordHash.
 */
public record AdminUserResponse(
        Long id,
        String email,
        String fullName,
        String phoneE164,
        String role,
        Boolean isEmailVerified,
        Boolean profileCompleted,
        String accountStatus,
        Instant suspendedUntilUtc,
        String statusReason,
        String preferredLanguage,
        String timezone,
        Instant createdAtUtc,
        Instant deletedAtUtc
) {}