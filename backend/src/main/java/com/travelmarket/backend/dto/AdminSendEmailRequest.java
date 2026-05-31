package com.travelmarket.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminSendEmailRequest(
    @NotBlank(message = "Subject cannot be blank")
    String subject,

    @NotBlank(message = "Body cannot be blank")
    String body
) {}
