package com.travelmarket.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class PublicGuideProfileResponse {
    private Long id;
    private String name;
    private String tagline;
    private String avatarUrl;
    private String coverImageUrl;
    private String bio;
    private String city;
    private String country;
    private List<String> expertise;
    private List<LanguageItem> languages;
    
    // Stats
    private Integer totalGuidedTrips;
    private Integer tourCount;
    private Double averageRating; // null for now
    
    private String memberSince;
    private boolean verified;

    @Data
    public static class LanguageItem {
        private String name;
        private String proficiency;
    }
}
