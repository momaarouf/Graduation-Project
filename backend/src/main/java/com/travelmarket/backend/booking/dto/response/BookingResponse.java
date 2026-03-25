package com.travelmarket.backend.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for traveler-facing booking endpoints.
 *
 * qrCode is included only in the traveler's own booking detail — it MUST NOT
 * appear in guide-facing or public responses.
 *
 * refundPercent is populated only after cancellation; null while active.
 * cancelledAtUtc is populated only after cancellation; null while active.
 *
 * Future fields to add here (do not restructure; add at the bottom):
 *   - paymentStatus (payment card)
 *   - reviewEligible (review card)
 *   - disputeOpen (dispute card)
 */
@Data
@Builder
public class BookingResponse {

    private Long id;

    // ── Occurrence context ──────────────────────────────────────────────────

    private Long occurrenceId;
    private String tourTitle;
    private String tourCoverImageUrl;   // resolved from TourMedia; null until media card
    private Instant startTimeUtc;
    private Instant endTimeUtc;
    private String meetingPointName;    // revealed to confirmed traveler only

    // ── Booking state ───────────────────────────────────────────────────────

    private String status;              // BookingStatus.name()
    private String bookingMode;         // BookingMode.name()
    private Integer peopleCount;

    // ── Pricing ─────────────────────────────────────────────────────────────

    private BigDecimal finalPrice;
    private String currency;

    // ── QR check-in (traveler's own booking only) ───────────────────────────

    /**
     * UUID token for the traveler's check-in QR.
     * Only included in the traveler's own detail response.
     * Must not be leaked in list responses or guide-facing responses.
     */
    private String qrCode;

    // ── Cancellation ────────────────────────────────────────────────────────

    private String cancellationReason;
    private BigDecimal refundPercent;   // null if not yet cancelled
    private Instant cancelledAtUtc;     // null if not yet cancelled

    // ── Timestamps ──────────────────────────────────────────────────────────

    private Instant createdAtUtc;
}