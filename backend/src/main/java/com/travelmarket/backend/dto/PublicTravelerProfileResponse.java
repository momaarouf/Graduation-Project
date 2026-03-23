package com.travelmarket.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class PublicTravelerProfileResponse {
    private Long id;
    private String fullName;
    private String tagline;
    private String bio;
    private String avatarUrl;
    private String coverImageUrl;
    private String location; // "City, Country"
    private String memberSince; // Month Year
    private String loyaltyTier;
    private Integer completedTrips;
    private List<String> preferences;
    private Boolean emailVerified;
    private Boolean phoneVerified;
}
