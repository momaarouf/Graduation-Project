package com.travelmarket.backend.review.repository;

import com.travelmarket.backend.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ── Duplicate prevention ──────────────────────────────────────────────────

    /**
     * Check if a NON-DELETED review already exists for this booking.
     * Used in ReviewService before creating a new review to enforce
     * the one-review-per-booking rule at the application level.
     * (DB UNIQUE constraint on booking_id is the final safety net.)
     *
     * Soft-delete filter: returns false if the existing review was deleted,
     * allowing the traveler to re-submit a review after an admin purge.
     */
    @Query("""
        SELECT COUNT(r) > 0 FROM Review r
        WHERE r.bookingId = :bookingId
          AND r.deletedAtUtc IS NULL
    """)
    boolean existsByBookingId(@Param("bookingId") Long bookingId);

    /**
     * Fetch the active (non-deleted) review for a specific booking.
     * Used to show the traveler their existing review from the booking detail page.
     * Soft-delete filter: returns empty if the review has been deleted.
     */
    @Query("""
        SELECT r FROM Review r
        WHERE r.bookingId = :bookingId
          AND r.deletedAtUtc IS NULL
    """)
    Optional<Review> findByBookingId(@Param("bookingId") Long bookingId);

    // ── Public listing queries ────────────────────────────────────────────

    /**
     * All visible, non-deleted reviews for a guide, newest first.
     * Partial index on (guide_id) WHERE is_hidden = FALSE keeps this fast.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            JOIN FETCH o.template
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findByGuideIdAndHiddenFalseOrderByCreatedAtDesc(
            @Param("guideId") Long guideId,
            Pageable pageable
    );

    /**
     * All visible, non-deleted reviews for a tour template with optional rating filter.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            JOIN FETCH o.template
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
              AND (:rating IS NULL OR r.ratingOverall = :rating)
            """)
    Page<Review> findByTourTemplateIdWithFilters(
            @Param("tourTemplateId") Long tourTemplateId,
            @Param("rating")         Integer rating,
            Pageable pageable
    );

    /**
     * All visible, non-deleted reviews for a guide with optional rating filter.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            JOIN FETCH o.template
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
              AND (:rating IS NULL OR r.ratingOverall = :rating)
            """)
    Page<Review> findByGuideIdWithFilters(
            @Param("guideId") Long guideId,
            @Param("rating")  Integer rating,
            Pageable pageable
    );

    // ── Traveler's own reviews ────────────────────────────────────────────

    /**
     * All non-deleted reviews written by a specific traveler, newest first.
     * Used for the "My Reviews" section in the traveler dashboard.
     * Includes hidden reviews — the traveler should see their own hidden reviews.
     * Excludes truly deleted reviews (deletedAtUtc IS NOT NULL).
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            JOIN FETCH o.template
            WHERE r.travelerId = :travelerId
              AND r.deletedAtUtc IS NULL
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findByTravelerIdOrderByCreatedAtDesc(
            @Param("travelerId") Long travelerId,
            Pageable pageable
    );

    // ── Aggregation queries ───────────────────────────────────────────────
    // Dynamic aggregation — computed on read, no cache table needed at this scale.
    // The WHERE is_hidden = FALSE partial indexes make these efficient.

    /**
     * Average overall rating for a guide (non-deleted, visible reviews only).
     * Returns null if the guide has no visible reviews yet.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT AVG(r.ratingOverall)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            """)
    Double findAverageOverallRatingByGuideId(@Param("guideId") Long guideId);

    /**
     * Total number of visible, non-deleted reviews for a guide.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            """)
    Long countVisibleReviewsByGuideId(@Param("guideId") Long guideId);

    /**
     * Average overall rating for a tour template (non-deleted, visible reviews only).
     * Returns null if the tour has no visible reviews yet.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT AVG(r.ratingOverall)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            """)
    Double findAverageOverallRatingByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);

    /**
     * Total number of visible, non-deleted reviews for a tour template.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            """)
    Long countVisibleReviewsByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);

    /**
     * Star distribution for a guide (non-deleted, visible reviews only).
     * Used to render the rating histogram in ReviewSummaryResponse.
     * Returns List of Object[]{ratingOverall (Short), count (Long)}
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r.ratingOverall, COUNT(r)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            GROUP BY r.ratingOverall
            """)
    java.util.List<Object[]> findRatingDistributionByGuideId(@Param("guideId") Long guideId);

    /**
     * Star distribution for a tour template (non-deleted, visible reviews only).
     * Returns List of Object[]{ratingOverall (Short), count (Long)}
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
            SELECT r.ratingOverall, COUNT(r)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
              AND r.deletedAtUtc IS NULL
            GROUP BY r.ratingOverall
            """)
    java.util.List<Object[]> findRatingDistributionByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);
}