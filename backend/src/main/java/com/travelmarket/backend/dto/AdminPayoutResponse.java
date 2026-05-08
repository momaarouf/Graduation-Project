package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AdminPayoutResponse {
    private Long id;
    private String payoutId; // payment.id or a formatted string
    private Long guideId;
    private String guideName;
    private String guideEmail;
    private String guideAvatar;
    private BigDecimal amount;
    private String currency;
    private String status; // mapped from payoutStatus and payoutEligibleAtUtc
    private String method; // whish, stripe, etc.
    private String methodDetails;
    private Long tourId;
    private String tourTitle;
    private Long bookingId;
    private BigDecimal platformFee;
    private BigDecimal guideEarnings;
    private String feeTier; // e.g. bronze, silver, gold, platinum
    private BigDecimal feeMultiplier;
    private Instant requestedAt;
    private Instant processedAt;
    private Instant completedAt;
    private Instant estimatedRelease;
}
