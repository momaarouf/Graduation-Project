package com.travelmarket.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class GuideCompleteProfileRequest {

    @NotBlank @Size(min = 2, max = 120)
    private String fullName;

    @NotBlank
    @Pattern(regexp="^\\+[1-9]\\d{7,14}$", message="Phone must be E.164 (e.g. +96170123456)")
    private String phoneE164;

    @NotBlank @Size(max = 60)
    private String country;

    @NotBlank @Size(max = 80)
    private String city;

    @NotBlank @Size(min = 30, max = 2000)
    private String bio;

    private List<String> expertise; // optional but recommended
    @NotEmpty(message = "At least one language is required")
    private List<LanguageItem> languages;

    @Data
    public static class LanguageItem {
        @NotBlank private String name;         // Arabic / English / French...
        @NotBlank private String proficiency;  // Beginner/Intermediate/Advanced
    }
}