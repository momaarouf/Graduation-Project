package com.travelmarket.backend.tour.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long occurrenceId;
    private String tourTitle;
    private String tourCoverImageUrl;
    private Instant startTimeUtc;
    private Instant endTimeUtc;
    private String meetingPointName;
    private String status;
    private String bookingMode;
    private Integer peopleCount;
    private BigDecimal finalPrice;
    private String currency;
    private String qrCode;
    private String cancellationReason;
    private java.math.BigDecimal refundPercent;
    private Instant createdAtUtc;
}
