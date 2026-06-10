package com.travelmarket.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Boolean requires2fa;
    private String tempToken;

    public AuthResponse(String token, String email, String role) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.requires2fa = false;
        this.tempToken = null;
    }

    public AuthResponse(Boolean requires2fa, String tempToken) {
        this.requires2fa = requires2fa;
        this.tempToken = tempToken;
        this.token = null;
        this.email = null;
        this.role = null;
    }
}
