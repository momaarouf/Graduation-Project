package com.travelmarket.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupportMessageRequest {
    @NotBlank
    private String content;
    
    // Optional for anonymous users if not logged in
    private String name;
    private String email;
}
