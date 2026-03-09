package com.travelmarket.backend.dto;

import java.time.Instant;

public record AdminAuditEventResponse(
        Long id,
        String action,
        String targetType,
        Long targetId,
        String summary,
        String detailsJson,
        Instant createdAtUtc,
        Long adminUserId,
        String adminEmail
) {}