package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.TourMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TourMediaRepository extends JpaRepository<TourMedia, Long> {

    /**
     * All non-deleted media for a template, ordered by display_order ascending.
     * The item at display_order = 0 (or lowest value) is the cover image.
     * Used when building TourDetailResponse and portfolio detail responses.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
        SELECT m FROM TourMedia m
        WHERE m.template.id = :templateId
          AND m.deletedAtUtc IS NULL
        ORDER BY m.displayOrder ASC
    """)
    List<TourMedia> findAllByTemplateIdOrdered(@Param("templateId") Long templateId);

    /**
     * Cover image only — the single non-deleted media item with the lowest display_order.
     * Used when building listing cards (PublicTourCardResponse,
     * GuidePortfolioTourResponse) where only the cover is needed.
     *
     * Returns the first result only; service layer calls .stream().findFirst().
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
        SELECT m FROM TourMedia m
        WHERE m.template.id = :templateId
          AND m.deletedAtUtc IS NULL
        ORDER BY m.displayOrder ASC
    """)
    List<TourMedia> findCoverByTemplateId(@Param("templateId") Long templateId);

    /**
     * Single media item by ID, scoped to a template.
     * Used when a guide deletes a specific image — verifies the media
     * belongs to their template before deletion.
     */
    @Query("""
        SELECT m FROM TourMedia m
        WHERE m.id = :mediaId
          AND m.template.id = :templateId
    """)
    Optional<TourMedia> findByIdAndTemplateId(
            @Param("mediaId") Long mediaId,
            @Param("templateId") Long templateId
    );

    /**
     * Count of active (non-deleted) media items for a template.
     * Used to enforce any future upload limits per tour.
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     */
    @Query("""
        SELECT COUNT(m) FROM TourMedia m
        WHERE m.template.id = :templateId
          AND m.deletedAtUtc IS NULL
    """)
    long countByTemplateId(@Param("templateId") Long templateId);

    /**
     * Fetches the lowest-displayOrder media item for EACH of the supplied
     * template IDs in a single query — eliminates the N+1 cover-image lookup
     * in listing endpoints.
     *
     * Returns ALL cover candidates; the service picks the first one per template.
     */
    @Query("""
        SELECT m FROM TourMedia m
        WHERE m.template.id IN :templateIds
          AND m.deletedAtUtc IS NULL
        ORDER BY m.template.id ASC, m.displayOrder ASC
    """)
    List<TourMedia> findCoversByTemplateIds(@Param("templateIds") Collection<Long> templateIds);
}