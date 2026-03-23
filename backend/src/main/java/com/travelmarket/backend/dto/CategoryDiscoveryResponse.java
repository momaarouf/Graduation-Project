package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDiscoveryResponse {
    private String id;
    private String name;
    private long tourCount;
    private String imageUrl;
}
