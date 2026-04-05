package com.travelmarket.backend.tour.dto.response;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Extended card response for the /api/public/tours/nearby endpoint.
 *
 * Identical to PublicTourCardResponse but adds a computed distanceKm field
 * so the frontend can display "2.3 km away" on each card and sort by proximity.
 *
 * distanceKm is computed server-side by the haversine formula in the
 * repository query — no client-side calculation needed.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class NearbyTourResponse extends PublicTourCardResponse {

    /**
     * Straight-line distance in kilometres from the requested lat/lng
     * to this tour's meeting point.
     *
     * Computed using the haversine formula:
     *   6371 * acos(cos(radians(reqLat)) * cos(radians(tourLat))
     *            * cos(radians(tourLng) - radians(reqLng))
     *            + sin(radians(reqLat)) * sin(radians(tourLat)))
     *
     * Rounded to 1 decimal place in the service before returning.
     * Null if the tour has no meeting coordinates set.
     */
    private Double distanceKm;
}