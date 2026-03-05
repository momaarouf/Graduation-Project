package com.travelmarket.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
            message = "Password must be at least 8 chars and include upper, lower, number, and special char"
    )
    private String password;

    // Traveler or Guide only (Admin never from public)
    @NotBlank
    @Pattern(regexp = "Traveler|Guide", message = "Role must be Traveler or Guide")
    private String role;

    // Optional at signup (autofill possible for OAuth later)
    @Size(min = 2, max = 120)
    private String fullName;

    // Agreements (professional)
    @AssertTrue(message = "You must agree to Terms")
    private boolean agreedToTerms;

    @AssertTrue(message = "You must agree to Privacy Policy")
    private boolean agreedToPrivacy;

    // Optional preferences
    private boolean newsletterOptIn;
    private boolean marketingOptIn;
}