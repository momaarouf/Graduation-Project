package com.travelmarket.backend.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class ConversationResponse {
    private Long id;
    private Long travelerId;
    private Long travelerProfileId;
    private String travelerName;
    private String travelerAvatarUrl;
    private String travelerLoyaltyTier;
    private Integer travelerTripsCount;
    
    private Long guideId;
    private Long guideProfileId;
    private String guideName;
    private String guideAvatarUrl;
    private Boolean guideIsVerified;
    private Integer guideTripsCount;
    
    private Long tourId;
    private String tourTitle;
    
    private Long bookingId;
    private String bookingStatus;
    private Instant bookingStartTimeUtc;
    private Integer peopleCount;
    private BigDecimal totalPrice;
    private String currency;
    
    private Instant updatedAtUtc;
    private String lastMessageContent;
    private Long unreadCount;
    private Boolean lastMessageRead;
}
