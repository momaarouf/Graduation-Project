package com.travelmarket.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class SupportMessageResponse {
    private Long id;
    private String senderName;
    private String senderEmail;
    private boolean isAdmin;
    private String content;
    private OffsetDateTime createdAtUtc;
}
