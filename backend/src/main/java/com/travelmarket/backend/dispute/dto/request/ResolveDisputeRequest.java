package com.travelmarket.backend.dispute.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ResolveDisputeRequest {
    @NotBlank(message = "Resolution note is required")
    private String resolutionNote;

    // Optional refund amount. If null/0, no refund is processed.
    private BigDecimal refundAmount;
}
