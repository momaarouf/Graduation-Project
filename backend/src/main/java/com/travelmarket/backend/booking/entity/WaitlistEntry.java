package com.travelmarket.backend.booking.entity;

import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Represents one traveler's place in the waitlist for a full TourOccurrence.
 *
 * ── Lifecycle ───────────────────────────────────────────────────────────────
 * 1. Traveler calls JOIN /api/traveler/waitlist when an occurrence is FULL.
 * 2. position is assigned as MAX(current positions) + 1, deterministically.
 * 3. When a booking is cancelled, BookingService.promoteFromWaitlist() finds
 *    the entry with the smallest position and creates a Booking for that traveler.
 * 4. promoted = true + promotedAtUtc set; the entry is soft-deleted to preserve
 *    the audit trail.
 * 5. Traveler can self-remove via DELETE /api/traveler/waitlist/{id}
 *    which soft-deletes and decrements occurrence.waitlistCount.
 *
 * ── Uniqueness ──────────────────────────────────────────────────────────────
 * DB UNIQUE (occurrence_id, traveler_id, deleted_at_utc) prevents a traveler
 * from joining the same waitlist twice while active (deleted_at_utc IS NULL).
 *
 * ── Future compatibility ────────────────────────────────────────────────────
 * - notified flag: set true when the notification card sends the "you're up"
 *   message; allows retry logic without double-notifying.
 * - promotedAtUtc: used by the payment card to open a time-limited payment
 *   window for the promoted traveler.
 * - Full auto-promotion payment flow lives in a later card; this entity
 *   already carries the correct state foundation.
 *
 * Soft delete: set deletedAtUtc; never hard-delete waitlist history.
 *
 * DB table: waitlist_entries (created in V1 schema, extended in V38)
 */
@Entity
@Table(name = "waitlist_entries")
@Getter
@Setter
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Relationships ───────────────────────────────────────────────────────

    // The full occurrence this traveler is waiting for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occurrence_id", nullable = false)
    private TourOccurrence occurrence;

    // The waiting traveler
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private TravelerProfile traveler;

    // ── Queue state ─────────────────────────────────────────────────────────

    /**
     * 1-based queue position, assigned at join time as MAX(position) + 1.
     * Lower position = earlier in queue = first to be promoted.
     * Never reassigned — gaps from deletions are acceptable; ordering is by position ASC.
     */
    @Column(name = "position", nullable = false)
    private Integer position;

    /**
     * Set true by the notification card after the "spot available" message is sent.
     * Prevents duplicate notifications if the promotion job retries.
     * Future notification card reads and sets this field.
     */
    @Column(name = "notified", nullable = false)
    private Boolean notified = false;

    /**
     * Set true when BookingService.promoteFromWaitlist() converts this entry
     * into a real Booking. Soft-delete follows immediately.
     * Future payment card may open a timed payment window using promotedAtUtc.
     */
    @Column(name = "promoted", nullable = false)
    private Boolean promoted = false;

    // Timestamp of promotion — payment window starts here (future payment card)
    @Column(name = "promoted_at_utc")
    private Instant promotedAtUtc;

    /**
     * Number of seats requested.
     * Stored here so the promotion job knows how many seats to allocate.
     */
    @Column(name = "people_count", nullable = false)
    private Integer peopleCount;

    // ── Audit timestamps ────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    // Soft delete — preserves waitlist audit history
    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
        updatedAtUtc = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAtUtc = Instant.now();
    }
}