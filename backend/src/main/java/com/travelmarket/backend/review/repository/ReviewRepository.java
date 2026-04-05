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

    // ── Duplicate prevention ──────────────────────────────────────────────

    /**
     * Check if a review already exists for this booking.
     * Used in ReviewService before creating a new review to enforce
     * the one-review-per-booking rule at the application level
     * (DB UNIQUE constraint is the final safety net).
     */
    boolean existsByBookingId(Long bookingId);

    /**
     * Fetch the review for a specific booking.
     * Used to show the traveler their existing review from the booking detail page.
     */
    Optional<Review> findByBookingId(Long bookingId);

    // ── Public listing queries ────────────────────────────────────────────

    /**
     * All visible reviews for a guide, newest first.
     * Partial index on (guide_id) WHERE is_hidden = FALSE keeps this fast.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            WHERE r.guideId = :guideId
              AND r.hidden = false
            ORDER BY r.createdAt DESC
            """)
    Page<Review> findByGuideIdAndHiddenFalseOrderByCreatedAtDesc(
            @Param("guideId") Long guideId,
            Pageable pageable
    );

    /**
     * All visible reviews for a tour template with optional rating filter.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
              AND (:rating IS NULL OR r.ratingOverall = :rating)
            """)
    Page<Review> findByTourTemplateIdWithFilters(
            @Param("tourTemplateId") Long tourTemplateId,
            @Param("rating")         Integer rating,
            Pageable pageable
    );

    /**
     * All visible reviews for a guide with optional rating filter.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            WHERE r.guideId = :guideId
              AND r.hidden = false
              AND (:rating IS NULL OR r.ratingOverall = :rating)
            """)
    Page<Review> findByGuideIdWithFilters(
            @Param("guideId") Long guideId,
            @Param("rating")  Integer rating,
            Pageable pageable
    );

    // ── Traveler's own reviews ────────────────────────────────────────────

    /**
     * All reviews written by a specific traveler, newest first.
     * Used for the "My Reviews" section in the traveler dashboard.
     * Includes hidden reviews — the traveler should see their own.
     */
    @Query("""
            SELECT r FROM Review r
            JOIN FETCH r.traveler t
            JOIN FETCH t.user u
            JOIN FETCH r.occurrence o
            WHERE r.travelerId = :travelerId
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
     * Average overall rating for a guide.
     * Returns null if the guide has no visible reviews yet.
     */
    @Query("""
            SELECT AVG(r.ratingOverall)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
            """)
    Double findAverageOverallRatingByGuideId(@Param("guideId") Long guideId);

    /**
     * Total number of visible reviews for a guide.
     */
    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
            """)
    Long countVisibleReviewsByGuideId(@Param("guideId") Long guideId);

    /**
     * Average overall rating for a tour template.
     * Returns null if the tour has no visible reviews yet.
     */
    @Query("""
            SELECT AVG(r.ratingOverall)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
            """)
    Double findAverageOverallRatingByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);

    /**
     * Total number of visible reviews for a tour template.
     */
    @Query("""
            SELECT COUNT(r)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
            """)
    Long countVisibleReviewsByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);

    /**
     * Star distribution for a guide — returns count per rating value (1–5).
     * Used to render the rating histogram in ReviewSummaryResponse.
     *
     * Returns List of Object[]{ratingOverall (Short), count (Long)}
     */
    @Query("""
            SELECT r.ratingOverall, COUNT(r)
            FROM Review r
            WHERE r.guideId = :guideId
              AND r.hidden = false
            GROUP BY r.ratingOverall
            """)
    java.util.List<Object[]> findRatingDistributionByGuideId(@Param("guideId") Long guideId);

    /**
     * Star distribution for a tour template.
     * Returns List of Object[]{ratingOverall (Short), count (Long)}
     */
    @Query("""
            SELECT r.ratingOverall, COUNT(r)
            FROM Review r
            WHERE r.tourTemplateId = :tourTemplateId
              AND r.hidden = false
            GROUP BY r.ratingOverall
            """)
    java.util.List<Object[]> findRatingDistributionByTourTemplateId(@Param("tourTemplateId") Long tourTemplateId);
}