package com.travelmarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GuideVerificationSubmitRequest {

    @NotBlank
    private String documentType; // NATIONAL_ID or PASSPORT

    @NotBlank
    private String idFrontImage;

    // required if NATIONAL_ID, optional if PASSPORT
    private String idBackImage;

    @NotBlank
    private String selfieImage;
}