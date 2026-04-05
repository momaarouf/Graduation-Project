package com.travelmarket.backend.tour.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request body for PUT /api/guide/occurrences/{occurrenceId}/route
 *
 * The guide provides an ordered list of waypoints defining the tour trail.
 * The entire route is replaced atomically — existing points for this
 * occurrence are deleted and the new list is inserted in one transaction.
 *
 * Validation rules (enforced by Bean Validation + service):
 *   - At least 2 waypoints required (start + end)
 *   - Each waypoint must have valid lat/lng coordinates
 *   - orderIndex values must be unique within the list (checked in service)
 *   - pointName is optional but capped at 255 chars
 */
public record SetTourRouteRequest(

        /**
         * Ordered list of waypoints.
         * Minimum 2: the route must have at least a start and an end point.
         * The guide is responsible for setting orderIndex values.
         * Convention: 0 = start, ascending = intermediate stops, highest = end.
         */
        @NotNull(message = "Waypoints list is required")
        @Size(min = 2, message = "A route must have at least 2 waypoints (start and end)")
        @Valid
        List<WaypointRequest> waypoints

) {

    /**
     * Single waypoint in the route.
     * Validated as part of the parent list via @Valid on the waypoints field.
     */
    public record WaypointRequest(

            /**
             * WGS-84 latitude. Must be in range [-90, 90].
             */
            @NotNull(message = "Latitude is required")
            @DecimalMin(value = "-90.0",  inclusive = true, message = "Latitude must be >= -90")
            @DecimalMax(value = "90.0",   inclusive = true, message = "Latitude must be <= 90")
            BigDecimal latitude,

            /**
             * WGS-84 longitude. Must be in range [-180, 180].
             */
            @NotNull(message = "Longitude is required")
            @DecimalMin(value = "-180.0", inclusive = true, message = "Longitude must be >= -180")
            @DecimalMax(value = "180.0",  inclusive = true, message = "Longitude must be <= 180")
            BigDecimal longitude,

            /**
             * 0-based position in the route. Must be unique within the list.
             * Uniqueness is validated in the service (not by Bean Validation).
             */
            @NotNull(message = "orderIndex is required")
            @Min(value = 0, message = "orderIndex must be >= 0")
            Integer orderIndex,

            /**
             * Optional label shown in the map pin popup.
             * Example: "Start: Jbeil", "Byblos Ruins", "End: Beirut Souks"
             */
            @Size(max = 255, message = "pointName must not exceed 255 characters")
            String pointName

    ) {}
}