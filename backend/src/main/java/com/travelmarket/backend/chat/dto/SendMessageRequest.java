package com.travelmarket.backend.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {

    private Long conversationId; // Provide if replying to an existing conversation
    private Long tourId;         // Provide if initiating a new conversation
    private Long bookingId;      // Optional: Provide if initiating a post-booking context

    @NotBlank(message = "Message content cannot be empty")
    private String content;

}
