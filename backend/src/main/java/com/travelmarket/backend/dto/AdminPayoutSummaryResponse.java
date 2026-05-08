package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AdminPayoutSummaryResponse {
    private long totalPending;
    private long totalFrozen;
    private long totalProcessing;
    private long totalCompleted;
    private long totalFailed;
    private BigDecimal totalAmount;
    private BigDecimal totalFees;
    private String averageProcessingTime;
}
