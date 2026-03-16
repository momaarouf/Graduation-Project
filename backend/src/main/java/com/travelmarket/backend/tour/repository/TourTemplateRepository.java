package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourTemplateRepository extends JpaRepository<TourTemplate, Long> {

    // ── Guide-scoped queries ────────────────────────────────────────────────────

    /**
     * All non-deleted templates owned by a specific guide.
     * Used by the guide dashboard tour list.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.guide.id = :guideId
          AND t.deletedAtUtc IS NULL
        ORDER BY t.createdAtUtc DESC
    """)
    List<TourTemplate> findAllByGuideId(@Param("guideId") Long guideId);

    /**
     * One non-deleted template owned by a specific guide.
     * Used for ownership-checked single-record operations (get, update, delete).
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.guide.id = :guideId
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findByIdAndGuideId(
            @Param("id") Long id,
            @Param("guideId") Long guideId
    );

    // ── Admin queries ───────────────────────────────────────────────────────────

    /**
     * All templates currently awaiting admin approval.
     * Ordered oldest-first so the admin works through the queue in order.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = 'PENDING_REVIEW'
          AND t.deletedAtUtc IS NULL
        ORDER BY t.updatedAtUtc ASC
    """)
    List<TourTemplate> findPendingReview();

    // ── Public listing queries ──────────────────────────────────────────────────

    /**
     * Public tour listing with optional filters.
     * Only PUBLISHED, non-deleted templates are returned.
     *
     * All filter params are nullable — pass null to skip that filter.
     * Uses LOWER() for case-insensitive region and category matching.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.status = 'PUBLISHED'
          AND t.deletedAtUtc IS NULL
          AND (:region IS NULL OR LOWER(t.region) = :region)
          AND (:category IS NULL OR LOWER(t.category) = :category)
          AND (:halalFriendly IS NULL OR t.halalFriendly = :halalFriendly)
          AND (:instantBook IS NULL OR t.instantBook = :instantBook)
          AND (:minPrice IS NULL OR t.basePrice >= :minPrice)
          AND (:maxPrice IS NULL OR t.basePrice <= :maxPrice)
        ORDER BY t.createdAtUtc DESC
    """)
    List<TourTemplate> findPublishedWithFilters(
            @Param("region") String region,
            @Param("category") String category,
            @Param("halalFriendly") Boolean halalFriendly,
            @Param("instantBook") Boolean instantBook,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice
    );

    /**
     * Single published, non-deleted template for the public tour detail page.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.status = 'PUBLISHED'
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findPublishedById(@Param("id") Long id);

    // ── Portfolio queries ───────────────────────────────────────────────────────

    /**
     * Guide portfolio — all tours that were ever approved and the guide
     * has opted into showing publicly, regardless of current status.
     *
     * Eligibility rule:
     *   last_published_at_utc IS NOT NULL  → was approved at least once
     *   show_in_portfolio = true           → guide has not opted out
     *   deleted_at_utc IS NULL             → not soft-deleted
     *
     * This correctly includes PUBLISHED, PAUSED, and ARCHIVED tours.
     * DRAFT and REJECTED tours are excluded because lastPublishedAtUtc is null.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.guide.id = :guideId
          AND t.lastPublishedAtUtc IS NOT NULL
          AND t.showInPortfolio = true
          AND t.deletedAtUtc IS NULL
        ORDER BY t.lastPublishedAtUtc DESC
    """)
    List<TourTemplate> findPortfolioByGuideId(@Param("guideId") Long guideId);

    /**
     * Single portfolio tour — applies the same eligibility rules as the list,
     * scoped to one tour and one guide (ownership check for the detail page).
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.guide.id = :guideId
          AND t.lastPublishedAtUtc IS NOT NULL
          AND t.showInPortfolio = true
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findPortfolioTourByIdAndGuideId(
            @Param("id") Long id,
            @Param("guideId") Long guideId
    );

    // ── Existence checks ────────────────────────────────────────────────────────

    /**
     * Used before soft-deleting a PUBLISHED template to enforce the rule:
     * a guide cannot delete a published tour that still has future occurrences.
     * The check itself is done in TourTemplateService using TourOccurrenceRepository.
     * This query is a lightweight ownership + status check.
     */
    @Query("""
        SELECT t FROM TourTemplate t
        WHERE t.id = :id
          AND t.deletedAtUtc IS NULL
    """)
    Optional<TourTemplate> findByIdNotDeleted(@Param("id") Long id);
}