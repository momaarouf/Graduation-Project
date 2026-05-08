package com.travelmarket.backend.tour.entity;

import com.travelmarket.backend.tour.enums.TourMediaType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * Represents a single media item (image or video) attached to a TourTemplate.
 *
 * Multiple media rows per template are fully supported — each row is one
 * file, ordered by display_order. The item with the lowest display_order
 * is treated as the cover image by the frontend.
 *
 * V1 supports IMAGE and VIDEO. V1 only uses IMAGE in practice;
 * VIDEO is defined in TourMediaType for future upload support.
 *
 * FK column name is tour_template_id to match the V1 schema.
 * Soft delete: set deleted_at_utc; never hard-delete media rows.
 * This preserves audit trail and ensures old Payment/Review references
 * remain intact even after a guide removes an image from their tour.
 * The parent template also uses soft delete (deleted_at_utc column).
 */
@Entity
@Table(name = "tour_media")
@Getter
@Setter
public class TourMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Parent template — media is always scoped to one template
    // Column name is tour_template_id to match V1 schema
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_template_id", nullable = false)
    private TourTemplate template;

    // Type of media — IMAGE (current) or VIDEO (future)
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 20)
    private TourMediaType mediaType;

    // Full URL to the stored file (CDN or object storage path)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    // Ordering within the gallery; lowest value = cover image
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    // Optional caption for the media item
    @Column(length = 255)
    private String caption;

    public TourMediaType getMediaType() {
        return mediaType;
    }

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    // updated_at_utc exists in V1 schema — retained for completeness
    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    /**
     * Soft delete timestamp.
     *
     * Set by TourMediaService.deleteMedia() when a guide removes an image.
     * The physical row is NEVER deleted — media history is preserved for audit.
     * All read queries MUST filter AND m.deletedAtUtc IS NULL.
     * Column added in V55__add_tour_media_soft_delete.sql.
     */
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