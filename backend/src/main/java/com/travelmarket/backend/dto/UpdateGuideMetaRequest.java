package com.travelmarket.backend.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateGuideMetaRequest {
    private String tagline;
    private String avatarUrl;
    private String coverImageUrl;
    private String socialLinksJson;
    private java.math.BigDecimal responseRate;
    private String responseTimeText;
}
