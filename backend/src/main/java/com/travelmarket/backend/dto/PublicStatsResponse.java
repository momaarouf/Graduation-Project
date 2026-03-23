package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PublicStatsResponse {
    private long verifiedGuidesCount;
    private long totalTravelersCount;
    private long completedToursCount;
    private long activeToursCount;
    private BigDecimal averageRating;
}
