package com.travelmarket.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class TravelerProfileResponse {
    private String fullName;
    private String phoneE164;
    private String country;
    private String city;
    private String nationality;
    private String dateOfBirth;     // yyyy-mm-dd
    private List<String> preferences;

    private String email;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String memberSince;
    private String loyaltyTier;
    private Integer completedTrips;
    private Boolean reviewReminderEnabled;
    private Boolean newsletterOptIn;
    // twoFactorEnabled is missing from model, fallback to false in frontend
}
