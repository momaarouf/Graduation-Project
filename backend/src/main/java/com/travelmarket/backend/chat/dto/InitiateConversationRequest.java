package com.travelmarket.backend.chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitiateConversationRequest {
    // Optional if bookingId is provided
    private Long tourId;
    
    // Optional
    private Long bookingId;
}
