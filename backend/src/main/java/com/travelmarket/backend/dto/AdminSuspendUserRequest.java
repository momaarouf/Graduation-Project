package com.travelmarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record AdminSuspendUserRequest(
        // Admin must provide a reason for auditing and future review.
        @NotBlank(message = "reason is required")
        String reason,

        // If null, suspension is indefinite and must be manually activated.
        // If set, it must be a future timestamp.
        Instant untilUtc
) {}