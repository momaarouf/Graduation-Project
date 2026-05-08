package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.TourOccurrence;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TourOccurrenceRepository extends JpaRepository<TourOccurrence, Long> {

  /**
   * Acquires a PostgreSQL row-level exclusive lock (SELECT ... FOR UPDATE) on the
   * TourOccurrence row BEFORE the caller checks capacity or modifies seats_reserved.
   *
   * This serializes concurrent booking attempts on the same slot:
   *   - First request grabs the lock → reads capacity → reserves seats → commits → releases lock.
   *   - All subsequent concurrent requests must WAIT (up to the timeout below).
   *   - After the first request commits, the next request proceeds with the updated
   *     seats_reserved value, sees the occurrence is full, and throws 409.
   *
   * Lock timeout (javax.persistence.lock.timeout = 2000 ms):
   *   If a request waits more than 2 seconds for the lock (e.g., previous holder is slow
   *   or crashed), it throws PessimisticLockingFailureException rather than blocking forever.
   *   GlobalExceptionHandler maps this to HTTP 409 "slot is being booked, try again."
   *
   * Why not optimistic? @Version on Booking only protects the Booking INSERT — it does NOT
   * prevent two threads from both passing the capacity check on the TourOccurrence row.
   * Pessimistic locking on the occurrence row closes this TOCTOU window completely.
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "2000"))
  @Query("SELECT o FROM TourOccurrence o WHERE o.id = :id AND o.deletedAtUtc IS NULL")
  Optional<TourOccurrence> findByIdWithLock(@Param("id") Long id);

  // ── Guide-scoped queries ────────────────────────────────────────────────────

  /**
   * All non-deleted occurrences for a specific template.
   * Ownership of the template is verified in the service layer before calling.
   * Returns all statuses so the guide can see their full schedule.
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.template.id = :templateId
            AND o.deletedAtUtc IS NULL
          ORDER BY o.startTimeUtc ASC
      """)
  List<TourOccurrence> findAllByTemplateId(@Param("templateId") Long templateId);

  /**
   * One non-deleted occurrence by its ID — no template scoping.
   * Used when updating/deleting a specific occurrence;
   * service layer verifies the parent template belongs to the guide.
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.id = :id
            AND o.deletedAtUtc IS NULL
      """)
  Optional<TourOccurrence> findByIdNotDeleted(@Param("id") Long id);

  // ── Ownership verification helper ───────────────────────────────────────────

  /**
   * Used to verify a guide owns an occurrence before allowing update/delete.
   * Joins through template to guide — if this returns empty, the occurrence
   * either doesn't exist, is deleted, or belongs to another guide.
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.id = :occurrenceId
            AND o.template.guide.id = :guideId
            AND o.deletedAtUtc IS NULL
      """)
  Optional<TourOccurrence> findByIdAndGuideId(
      @Param("occurrenceId") Long occurrenceId,
      @Param("guideId") Long guideId);

  // ── Public queries ──────────────────────────────────────────────────────────

  /**
   * Future, active occurrences for a published tour (public endpoint).
   *
   * Visibility rules:
   * - Template must have last_published_at_utc IS NOT NULL (ever approved)
   * This keeps occurrences visible while the guide re-edits a live tour
   * (status may be PENDING_REVIEW but last_published_at_utc is set).
   * - Template must not be deleted
   * - Occurrence must not be deleted
   * - Occurrence start must be in the future
   * - Occurrence status must be SCHEDULED or FULL
   * (COMPLETED and CANCELLED are excluded from the active listing)
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.template.id = :templateId
            AND o.template.lastPublishedAtUtc IS NOT NULL
            AND o.template.deletedAtUtc IS NULL
            AND o.deletedAtUtc IS NULL
            AND o.startTimeUtc > :now
            AND o.status IN ('SCHEDULED', 'FULL')
          ORDER BY o.startTimeUtc ASC
      """)
  List<TourOccurrence> findPublicFutureByTemplateId(
      @Param("templateId") Long templateId,
      @Param("now") Instant now);

  // ── Portfolio queries ───────────────────────────────────────────────────────

  /**
   * Completed occurrences for a template — used in the guide portfolio
   * detail page to show the run history with attendee counts and dates.
   *
   * Shows how many times the guide has actually run this tour and
   * how many travelers attended each run (via seats_reserved).
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.template.id = :templateId
            AND o.status = 'COMPLETED'
            AND o.deletedAtUtc IS NULL
          ORDER BY o.startTimeUtc DESC
      """)
  List<TourOccurrence> findCompletedByTemplateId(@Param("templateId") Long templateId);

  // ── Business rule checks ────────────────────────────────────────────────────

  /**
   * Checks whether a PUBLISHED template has any future, non-deleted,
   * non-cancelled occurrences. Used to enforce the rule that a guide
   * cannot soft-delete a published tour with active upcoming dates.
   */
  @Query("""
          SELECT COUNT(o) > 0 FROM TourOccurrence o
          WHERE o.template.id = :templateId
            AND o.deletedAtUtc IS NULL
            AND o.startTimeUtc > :now
            AND o.status NOT IN ('CANCELLED', 'COMPLETED')
      """)
  boolean hasActiveFutureOccurrences(
      @Param("templateId") Long templateId,
      @Param("now") Instant now);

  /**
   * Next upcoming occurrence for a template.
   * Used to populate nextOccurrenceStartUtc on public listing cards.
   * Returns the earliest future SCHEDULED occurrence, or empty if none.
   */
  @Query("""
          SELECT o FROM TourOccurrence o
          WHERE o.template.id = :templateId
            AND o.template.lastPublishedAtUtc IS NOT NULL
            AND o.template.deletedAtUtc IS NULL
            AND o.deletedAtUtc IS NULL
            AND o.startTimeUtc > :now
            AND o.status = 'SCHEDULED'
          ORDER BY o.startTimeUtc ASC
      """)
  List<TourOccurrence> findNextScheduledByTemplateId(
      @Param("templateId") Long templateId,
      @Param("now") Instant now);

  boolean existsByTemplateIdAndStartTimeUtc(Long templateId, Instant startTimeUtc);

  Optional<TourOccurrence> findByTemplateIdAndStartTimeUtc(Long templateId, Instant startTimeUtc);

  List<TourOccurrence> findAllByTemplateIdAndStartTimeUtcGreaterThanEqual(Long templateId, Instant now);

  // ── Batch query for listing cards (eliminates N+1) ──────────────────────────

  /**
   * Fetches the earliest future SCHEDULED or FULL occurrence for EACH of the
   * supplied template IDs in a single query.
   *
   * Returns ALL matching occurrences across all template IDs; the service layer
   * picks the first one per template using a grouping map.
   * Used by listTours / getToursInBoundingBox / getNearbyTours to avoid
   * the previous N+1 pattern of one query per tour.
   */
  @Query("""
      SELECT o FROM TourOccurrence o
      WHERE o.template.id IN :templateIds
        AND o.template.lastPublishedAtUtc IS NOT NULL
        AND o.template.deletedAtUtc IS NULL
        AND o.deletedAtUtc IS NULL
        AND o.startTimeUtc > :now
        AND o.status IN ('SCHEDULED', 'FULL')
      ORDER BY o.template.id ASC, o.startTimeUtc ASC
  """)
  List<TourOccurrence> findPublicFutureByTemplateIds(
      @Param("templateIds") Collection<Long> templateIds,
      @Param("now") Instant now);

  @Query("""
      SELECT o FROM TourOccurrence o
      WHERE o.template.id IN :templateIds
        AND o.status = :status
        AND o.deletedAtUtc IS NULL
  """)
  List<TourOccurrence> findAllByTemplateIdInAndStatus(
      @Param("templateIds") Collection<Long> templateIds,
      @Param("status")      com.travelmarket.backend.tour.enums.TourOccurrenceStatus status);
}