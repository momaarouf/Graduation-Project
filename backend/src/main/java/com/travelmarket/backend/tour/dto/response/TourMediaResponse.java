package com.travelmarket.backend.tour.dto.response;

import lombok.Data;

@Data
public class TourMediaResponse {
    private Long id;
    private String mediaType;   // "IMAGE" or "VIDEO"
    private String url;
    private Integer displayOrder;
}