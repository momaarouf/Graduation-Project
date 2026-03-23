package com.travelmarket.backend.tour.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class GuideBookingResponse {
    private Long id;
    private Long occurrenceId;
    private String tourTitle;
    private Instant startTimeUtc;
    private Instant endTimeUtc;
    private String status;
    private String bookingMode;
    private Integer peopleCount;
    private BigDecimal finalPrice;
    private String currency;
    private Instant createdAtUtc;
    private TravelerInfo traveler;

    @Data
    @Builder
    public static class TravelerInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phoneE164;
    }
}
