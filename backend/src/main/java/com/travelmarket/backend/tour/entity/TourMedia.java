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
 * No soft delete — media rows are physically removed when a guide
 * deletes a specific image. The parent template uses soft delete.
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

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    // updated_at_utc exists in V1 schema — retained for completeness
    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

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