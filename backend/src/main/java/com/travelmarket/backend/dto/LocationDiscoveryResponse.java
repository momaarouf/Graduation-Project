package com.travelmarket.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LocationDiscoveryResponse {
    private String name;
    private long tourCount;
    private String imageUrl;
}
