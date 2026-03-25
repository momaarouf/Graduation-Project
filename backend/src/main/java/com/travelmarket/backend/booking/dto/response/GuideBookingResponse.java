package com.travelmarket.backend.booking.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for guide-facing booking endpoints.
 *
 * Intentionally omits the traveler's qrCode — guides use a separate
 * QR scanner flow via /api/guide/bookings/{id}/checkin, not by reading
 * the traveler's own QR token.
 *
 * TravelerInfo exposes only the contact fields the guide needs for
 * logistics (name, email, phone). Full traveler profile data is not included.
 *
 * checkedInAtUtc and completedAtUtc are included so the guide's dashboard
 * can show real-time progress across an occurrence's bookings.
 */
@Data
@Builder
public class GuideBookingResponse {

    private Long id;

    // ── Occurrence context ──────────────────────────────────────────────────

    private Long occurrenceId;
    private String tourTitle;
    private Instant startTimeUtc;
    private Instant endTimeUtc;

    // ── Booking state ───────────────────────────────────────────────────────

    private String status;              // BookingStatus.name()
    private String bookingMode;         // BookingMode.name()
    private Integer peopleCount;

    // ── Pricing (guide can see payout context) ──────────────────────────────

    private BigDecimal finalPrice;
    private String currency;

    // ── Cancellation ────────────────────────────────────────────────────────

    private String cancellationReason;

    // ── Check-in / completion timestamps ───────────────────────────────────

    private Instant checkedInAtUtc;     // null until guide marks check-in
    private Instant completedAtUtc;     // null until guide marks completed

    // ── Timestamps ──────────────────────────────────────────────────────────

    private Instant createdAtUtc;

    // ── Traveler contact (guide logistics only) ─────────────────────────────

    private TravelerInfo traveler;

    /**
     * Minimal traveler contact info exposed to the guide.
     * Full traveler profile is private; only logistics-relevant fields shown.
     */
    @Data
    @Builder
    public static class TravelerInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phoneE164;
    }
}