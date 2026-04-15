package com.travelmarket.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateNotificationPreferencesRequest {
    @NotNull(message = "Email notifications enabled flag is required")
    private Boolean emailNotificationsEnabled;

    @NotNull(message = "Push notifications enabled flag is required")
    private Boolean pushNotificationsEnabled;
}
