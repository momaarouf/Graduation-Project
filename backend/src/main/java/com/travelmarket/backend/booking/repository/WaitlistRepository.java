package com.travelmarket.backend.booking.repository;

import com.travelmarket.backend.booking.entity.WaitlistEntry;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WaitlistEntry persistence.
 *
 * All queries filter on deletedAtUtc IS NULL to work with only active entries.
 * Soft-deleted entries (promoted or self-removed) are excluded from queue logic.
 */
public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

    // ── Queue ordering ──────────────────────────────────────────────────────

    /**
     * Returns all active waitlist entries for an occurrence, in queue order.
     * Used by promoteFromWaitlist to find who is next.
     */
    List<WaitlistEntry> findByOccurrenceAndDeletedAtUtcIsNullOrderByPositionAsc(
            TourOccurrence occurrence);

    /**
     * Finds the next traveler to promote (position = MIN active position).
     * Extracted as a dedicated query to avoid loading the full list for promotion.
     */
    @Query("""
            SELECT w FROM WaitlistEntry w
            WHERE w.occurrence = :occurrence
              AND w.deletedAtUtc IS NULL
              AND w.promoted = false
            ORDER BY w.position ASC
            LIMIT 1
            """)
    Optional<WaitlistEntry> findNextForPromotion(@Param("occurrence") TourOccurrence occurrence);

    /**
     * Current maximum position for an occurrence (used to assign next position).
     * Returns null if no active entries exist (first joiner gets position 1).
     */
    @Query("""
            SELECT MAX(w.position) FROM WaitlistEntry w
            WHERE w.occurrence = :occurrence
              AND w.deletedAtUtc IS NULL
            """)
    Integer findMaxPositionForOccurrence(@Param("occurrence") TourOccurrence occurrence);

    // ── Existence checks ────────────────────────────────────────────────────

    /**
     * Checks if a traveler already has an active waitlist entry for this occurrence.
     * Prevents duplicate waitlist entries.
     */
    Optional<WaitlistEntry> findByOccurrenceAndTravelerAndDeletedAtUtcIsNull(
            TourOccurrence occurrence, TravelerProfile traveler);

    // ── Traveler view ───────────────────────────────────────────────────────

    /**
     * All active waitlist entries for a traveler, newest first.
     * Used for GET /api/traveler/waitlist.
     */
    List<WaitlistEntry> findByTravelerAndDeletedAtUtcIsNullOrderByCreatedAtUtcDesc(
            TravelerProfile traveler);

    /**
     * Traveler's own waitlist entry by id — ownership enforced by traveler join.
     * Used for DELETE /api/traveler/waitlist/{id}.
     */
    Optional<WaitlistEntry> findByIdAndTravelerAndDeletedAtUtcIsNull(
            Long id, TravelerProfile traveler);
}