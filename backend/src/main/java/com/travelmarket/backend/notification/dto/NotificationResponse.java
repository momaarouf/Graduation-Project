package com.travelmarket.backend.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.travelmarket.backend.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    @JsonProperty("referenceId")
    private String referenceId;
    @JsonProperty("referenceType")
    private String referenceType;
    private LocalDateTime createdAtUtc;
    @JsonProperty("isRead")
    private boolean read;
}
