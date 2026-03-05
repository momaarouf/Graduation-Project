package com.travelmarket.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class TravelerCompleteProfileRequest {

    @NotBlank @Size(min = 2, max = 120)
    private String fullName;

    @NotBlank
    @Pattern(regexp="^\\+[1-9]\\d{7,14}$", message="Phone must be E.164 (e.g. +96170123456)")
    private String phoneE164;

    @NotBlank @Size(max = 60)
    private String country;

    @NotBlank @Size(max = 80)
    private String city;

    private String nationality;     // optional
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "dateOfBirth must be in YYYY-MM-DD format")
    private String dateOfBirth;     // optional yyyy-mm-dd
    private List<String> preferences; // optional
}