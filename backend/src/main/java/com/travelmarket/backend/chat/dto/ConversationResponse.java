package com.travelmarket.backend.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ConversationResponse {
    private Long id;
    private Long travelerId;
    private String travelerName;
    private Long guideId;
    private String guideName;
    private Long tourId;
    private String tourTitle;
    private Long bookingId;
    private Instant updatedAtUtc;
}
