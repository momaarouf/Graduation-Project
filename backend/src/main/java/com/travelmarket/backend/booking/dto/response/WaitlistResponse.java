package com.travelmarket.backend.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for waitlist endpoints.
 *
 * position is the traveler's current rank in the queue (1 = next to be promoted).
 * Gaps are possible (others above may have left the queue), but position values
 * are never reassigned — ordering by position ASC always gives the correct queue.
 *
 * notified will be set true by the future notification card once the traveler
 * has been messaged about their promotion.
 *
 * promoted is true once the traveler has been given a real Booking.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WaitlistResponse {

    private Long id;

    // ── Occurrence context ──────────────────────────────────────────────────

    private Long occurrenceId;
    private String tourTitle;
    private Instant startTimeUtc;
    private Instant endTimeUtc;

    // ── Queue state ─────────────────────────────────────────────────────────

    private Integer position;           // rank in the queue (lower = earlier)
    private Integer peopleCount;        // number of seats requested
    private Boolean notified;           // has the traveler been messaged? (future notification card)
    private Boolean promoted;           // has a Booking been created for this entry?
    private Instant promotedAtUtc;      // when promotion happened (null if not yet promoted)

    // ── Timestamps ──────────────────────────────────────────────────────────

    private Instant createdAtUtc;
}