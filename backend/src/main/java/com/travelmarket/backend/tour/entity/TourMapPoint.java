package com.travelmarket.backend.tour.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents one waypoint on the route of a TourOccurrence.
 *
 * Map points are ordered via order_index to form the tour's path.
 * This table is structure-ready now; active use begins when the
 * frontend map UI is implemented.
 *
 * No soft delete — map points are physically replaced when a guide
 * updates the route for an occurrence.
 */
@Entity
@Table(name = "tour_map_points")
@Getter
@Setter
public class TourMapPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The specific occurrence this route belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occurrence_id", nullable = false)
    private TourOccurrence occurrence;

    // Waypoint coordinates
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    // Position in the ordered route (0-based or 1-based, guide's choice)
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
    }
}