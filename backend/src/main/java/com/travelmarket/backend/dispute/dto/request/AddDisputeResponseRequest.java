package com.travelmarket.backend.dispute.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddDisputeResponseRequest {
    @NotBlank(message = "Response cannot be empty")
    private String response;
}
