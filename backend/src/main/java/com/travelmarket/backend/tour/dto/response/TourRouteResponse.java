package com.travelmarket.backend.tour.dto.response;

import java.time.Instant;
import java.util.List;

/**
 * Full route response for a tour — returned by GET /api/public/tours/{id}/route.
 *
 * Bundles the ordered waypoints with context about which occurrence
 * the route belongs to (a tour's route is defined per occurrence,
 * so different runs could theoretically have different paths).
 *
 * The frontend uses this to:
 *   1. Draw a polyline through waypoints (the trail)
 *   2. Place labelled pins at each stop
 *   3. Show the occurrence start time in the map card header
 */
public record TourRouteResponse(

        Long tourTemplateId,

        /**
         * The occurrence this route is associated with.
         * Always the next upcoming SCHEDULED occurrence of the tour.
         * Null if the tour has no future occurrences (no route to show).
         */
        Long occurrenceId,

        /**
         * When this occurrence starts — shown in the map UI header
         * so travelers know which run they're looking at.
         */
        Instant occurrenceStartUtc,

        /**
         * Ordered list of waypoints forming the trail.
         * Pre-sorted by orderIndex ASC by the repository.
         * Minimum 2 points required to define a valid route.
         * Empty list means the guide has not yet set a route for this tour.
         */
        List<TourMapPointResponse> waypoints

) {}