package com.travelmarket.backend.chat.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReadReceiptResponse {
    private final String type = "READ_RECEIPT";
    private Long conversationId;
    private Instant readAt;
    private Long readerId;
}
