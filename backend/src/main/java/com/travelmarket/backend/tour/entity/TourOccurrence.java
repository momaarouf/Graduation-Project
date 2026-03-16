package com.travelmarket.backend.tour.entity;

import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Represents one scheduled run of a TourTemplate.
 *
 * A guide creates occurrences under a PUBLISHED template to open up
 * bookable time slots. Each occurrence tracks its own capacity state
 * via seats_reserved (populated by the booking card).
 *
 * Ownership rule: occurrence ownership is inherited from the parent template.
 * A guide may only manage occurrences under their own templates.
 * Enforced in TourOccurrenceService, not at DB level.
 *
 * Public visibility rule (enforced in PublicTourService):
 *   - Parent template must have last_published_at_utc IS NOT NULL
 *   - Parent template must not be soft-deleted
 *   - Occurrence must not be soft-deleted
 *   - start_time_utc must be in the future
 *   - status must be SCHEDULED or FULL
 *
 * Portfolio visibility (completed runs shown on guide profile):
 *   - status = COMPLETED
 *   - Parent template show_in_portfolio = true
 *   - Parent template last_published_at_utc IS NOT NULL
 *
 * Soft delete: set deleted_at_utc; never hard-delete.
 *
 * Note: confirmed_seats_count, waitlist_count, and is_kill_switched are
 * V1 columns retained for future booking and operations use.
 * seats_reserved (added V17) is the active counter updated by booking logic.
 */
@Entity
@Table(name = "tour_occurrences")
@Getter
@Setter
public class TourOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Parent tour template — must be PUBLISHED to allow new occurrence creation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TourTemplate template;

    // ── Schedule ───────────────────────────────────────────────────────────────

    // All times stored and returned in UTC
    @Column(name = "start_time_utc", nullable = false)
    private Instant startTimeUtc;

    @Column(name = "end_time_utc", nullable = false)
    private Instant endTimeUtc;

    // ── Status ─────────────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TourOccurrenceStatus status = TourOccurrenceStatus.SCHEDULED;

    // ── Capacity tracking ──────────────────────────────────────────────────────

    /**
     * Current number of seats taken by confirmed bookings.
     * Incremented/decremented transactionally by the booking card.
     * Used in portfolio detail to show how many travelers attended each run.
     * Public endpoints use this against template.maxCapacity to show availability.
     */
    @Column(name = "seats_reserved", nullable = false)
    private Integer seatsReserved = 0;

    // V1 columns retained for booking card compatibility
    @Column(name = "confirmed_seats_count")
    private Integer confirmedSeatsCount = 0;

    @Column(name = "waitlist_count")
    private Integer waitlistCount = 0;

    // Emergency kill switch for admin use (future operations tooling)
    @Column(name = "is_kill_switched")
    private Boolean isKillSwitched = false;

    // Region retained from V1 (may differ from template region for special runs)
    @Column(length = 100)
    private String region;

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    // Soft delete — never hard-delete occurrences
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