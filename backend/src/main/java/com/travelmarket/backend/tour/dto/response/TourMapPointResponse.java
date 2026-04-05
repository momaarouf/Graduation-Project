package com.travelmarket.backend.tour.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for a single waypoint on a tour route.
 *
 * Returned as an ordered list inside TourRouteResponse.
 * The frontend connects these points as a Leaflet.js polyline
 * to draw the trail on the map.
 *
 * Ordering: sort by orderIndex ascending before drawing.
 *   orderIndex == lowest  → start of route (e.g. "Start: Jbeil")
 *   orderIndex == highest → end of route   (e.g. "End: Beirut")
 */
public record TourMapPointResponse(

        Long id,

        /**
         * WGS-84 latitude. Range: -90.0 to 90.0.
         * Stored as DECIMAL(10,8) — millimetre precision.
         */
        BigDecimal latitude,

        /**
         * WGS-84 longitude. Range: -180.0 to 180.0.
         * Stored as DECIMAL(11,8) — millimetre precision.
         */
        BigDecimal longitude,

        /**
         * 0-based position in the ordered route.
         * List is pre-sorted by the repository — this field is included
         * so the frontend can re-sort client-side if needed.
         */
        Integer orderIndex,

        /**
         * Optional human-readable label shown in the map popup.
         * Examples: "Start: Jbeil", "Byblos Roman Ruins", "End: Beirut Souks"
         * Null if the guide did not provide a name for this stop.
         */
        String pointName

) {}