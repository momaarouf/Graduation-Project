package com.travelmarket.backend.dispute.dto.response;

import com.travelmarket.backend.dispute.enums.DisputeReason;
import com.travelmarket.backend.dispute.enums.DisputeStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class DisputeResponse {
    private Long id;
    private Long bookingId;
    
    private Long openedByUserId;
    private String openedByFullName;
    private String openedByRole;
    
    private Long againstUserId;
    private String againstFullName;
    private String againstRole;
    
    private DisputeReason reason;
    private String description;
    private String againstUserResponse;
    private DisputeStatus status;
    private String resolutionNote;
    private BigDecimal refundAmount;
    
    private Instant createdAtUtc;
    private Instant updatedAtUtc;
}
