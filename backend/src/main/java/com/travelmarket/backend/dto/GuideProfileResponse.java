package com.travelmarket.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class GuideProfileResponse {
    private Long id;
    private String fullName;
    private String phoneE164;
    private String country;
    private String city;
    private String bio;
    private String tagline;
    private String avatarUrl;
    private String coverImageUrl;
    private Integer tourCount;
    private List<String> expertise;
    private List<LanguageItem> languages;

    private String email;
    private String memberSince;
    private String verifiedSince;
    private Integer totalTrips;
    private Integer totalTravelers;
    private java.math.BigDecimal impactScore;
    
    // New metrics and social
    private String socialLinksJson;
    private java.math.BigDecimal responseRate;
    private String responseTimeText;
    
    // Verification fields
    private String verificationStatus;
    private String idDocumentType;
    private String rejectionReason;

    @Data
    public static class LanguageItem {
        private String name;
        private String proficiency;
    }
}
