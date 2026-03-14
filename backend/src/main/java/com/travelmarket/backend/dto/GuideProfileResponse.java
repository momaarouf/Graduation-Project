package com.travelmarket.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class GuideProfileResponse {
    private String fullName;
    private String phoneE164;
    private String country;
    private String city;
    private String bio;
    private List<String> expertise;
    private List<LanguageItem> languages;

    private String email;
    private String memberSince;
    private String verifiedSince;
    private Integer totalTrips;
    private Integer totalTravelers;
    private java.math.BigDecimal impactScore;
    
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
