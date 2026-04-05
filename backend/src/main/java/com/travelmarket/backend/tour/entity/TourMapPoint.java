package com.travelmarket.backend.tour.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents one waypoint on the guided route of a TourOccurrence.
 *
 * Waypoints are ordered via order_index to form the tour's path (trail).
 * The frontend connects them as a Leaflet.js polyline on the map.
 *
 * Convention:
 *   - Lowest order_index  = start point (e.g. "Start: Jbeil")
 *   - Highest order_index = end point   (e.g. "End: Beirut")
 *   - Middle points are stops along the route
 *
 * Minimum 2 waypoints required to define a route (validated in service).
 *
 * No soft delete — map points are physically replaced (delete-all + re-insert)
 * when a guide updates the route for an occurrence. This avoids stale ordering
 * issues that would occur with soft deletes.
 */
@Entity
@Table(
        name = "tour_map_points",
        indexes = {
                // Fast lookup of all waypoints for one occurrence, sorted by order
                @Index(name = "idx_map_points_occurrence_order",
                        columnList = "occurrence_id, order_index")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourMapPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The specific occurrence this route belongs to.
    // Route is per-occurrence so guides can adjust the path for special runs.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occurrence_id", nullable = false)
    private TourOccurrence occurrence;

    // ── Waypoint coordinates ──────────────────────────────────────────────────
    // Precision matches the DB columns: DECIMAL(10,8) and DECIMAL(11,8)
    // which gives ~1.1mm accuracy — more than sufficient for tour routing.

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    // ── Route ordering ────────────────────────────────────────────────────────

    /**
     * Position of this point in the ordered route (0-based).
     * The guide supplies these values; service validates uniqueness within
     * the set before saving. Frontend sorts by this field before drawing.
     */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // ── Waypoint label ────────────────────────────────────────────────────────

    /**
     * Optional human-readable label for this stop.
     * Examples: "Start: Jbeil", "Byblos Roman Ruins", "End: Beirut Souks"
     * Added in V44. Nullable — existing rows without a name still work.
     * Shown in the map popup when a traveler clicks a pin.
     */
    @Column(name = "point_name", length = 255)
    private String pointName;

    // ── Timestamp ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @PrePersist
    protected void onCreate() {
        this.createdAtUtc = Instant.now();
    }
}