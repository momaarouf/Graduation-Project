package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.dto.PublicGuideProfileResponse;
import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.service.PublicTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public tour browsing, geo-search, and guide portfolio endpoints.
 * No authentication required — all endpoints under /api/public are permitAll.
 *
 * Existing endpoints (unchanged):
 *   GET /api/public/tours                            browse with text/scalar filters
 *   GET /api/public/tours/{id}                       tour detail
 *   GET /api/public/tours/{id}/occurrences           future active occurrences
 *   GET /api/public/guides/{guideId}                 public guide profile
 *   GET /api/public/guides/{guideId}/tours           guide portfolio list
 *   GET /api/public/guides/{guideId}/tours/{tourId}  portfolio tour detail
 *   GET /api/public/guides/search                    search guides by name
 *
 * New geo endpoints:
 *   GET /api/public/tours                            + minLat/maxLat/minLng/maxLng
 *                                                    → bounding box search (map pan/zoom)
 *   GET /api/public/tours/nearby                     → radius search (near me)
 *   GET /api/public/tours/{id}/route                 → ordered waypoints (trail polyline)
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicTourController {

    private final PublicTourService publicTourService;

    // ── Tour listing (text/scalar filters) ─────────────────────────────────────

    /**
     * Public tour browse with optional filters.
     * All params are optional — omit to return all published tours.
     *
     * Bounding box search is triggered when ALL FOUR of
     * minLat, maxLat, minLng, maxLng are provided.
     * When bounding box params are present the text/scalar filters are ignored
     * and the geo path is taken — keeping the URL clean without a separate route.
     *
     * Text/scalar query params:
     *   region, category, cities, query, halalFriendly, instantBook,
     *   minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
     *   minRating, isPremium, isFamilyFriendly, hasGroupDiscount, language, sortBy
     *
     * Bounding box params (all four required together):
     *   minLat — south edge latitude  (e.g. 33.5)
     *   maxLat — north edge latitude  (e.g. 34.1)
     *   minLng — west  edge longitude (e.g. 35.4)
     *   maxLng — east  edge longitude (e.g. 36.0)
     */
    @GetMapping("/tours")
    public List<PublicTourCardResponse> listTours(
            // ── existing text/scalar filters ─────────────────────────────────
            @RequestParam(required = false) List<String> regions,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> cities,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean halalFriendly,
            @RequestParam(required = false) Boolean instantBook,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) Integer minCap,
            @RequestParam(required = false) Integer maxCap,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean isPremium,
            @RequestParam(required = false) Boolean isFamilyFriendly,
            @RequestParam(required = false) Boolean hasGroupDiscount,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String sortBy,
            // ── bounding box params (new — all four required together) ────────
            @RequestParam(required = false) BigDecimal minLat,
            @RequestParam(required = false) BigDecimal maxLat,
            @RequestParam(required = false) BigDecimal minLng,
            @RequestParam(required = false) BigDecimal maxLng,
            // ── pagination params ───────────────────────────────────────────
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset
    ) {

        // If all four bounding box params are provided → geo path
        boolean hasBbox = minLat != null && maxLat != null
                && minLng != null && maxLng != null;

        if (hasBbox) {
            // Validate bounding box: min must be less than max
            if (minLat.compareTo(maxLat) >= 0) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "minLat must be less than maxLat");
            }
            if (minLng.compareTo(maxLng) >= 0) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "minLng must be less than maxLng");
            }
            // Validate coordinate ranges
            validateLatRange(minLat, "minLat");
            validateLatRange(maxLat, "maxLat");
            validateLngRange(minLng, "minLng");
            validateLngRange(maxLng, "maxLng");

            return publicTourService.getToursInBoundingBox(minLat, maxLat, minLng, maxLng);
        }

        // Standard text/scalar filter path — unchanged from existing behaviour
        return publicTourService.listTours(
                regions, category, cities, query, halalFriendly, instantBook,
                minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                minRating, isPremium, isFamilyFriendly, hasGroupDiscount, language, sortBy,
                limit, offset);
    }

    // ── Nearby search (radius) ──────────────────────────────────────────────────

    /**
     * Returns published tours within radiusKm of the supplied centre point,
     * sorted by distance ascending (closest first).
     *
     * Each result includes distanceKm so the frontend can show "2.3 km away".
     *
     * Query params (all required):
     *   lat       — centre latitude  (-90 to 90)
     *   lng       — centre longitude (-180 to 180)
     *   radiusKm  — search radius in kilometres (0.1 to 500)
     *
     * Example: GET /api/public/tours/nearby?lat=33.89&lng=35.50&radiusKm=50
     */
    @GetMapping("/tours/nearby")
    public List<NearbyTourResponse> getNearbyTours(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radiusKm) {

        // Validate coordinate ranges
        if (lat < -90 || lat > 90) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "lat must be between -90 and 90");
        }
        if (lng < -180 || lng > 180) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "lng must be between -180 and 180");
        }
        // Validate radius: must be positive and reasonable
        // 500 km covers the entire Middle East region — safe upper bound
        if (radiusKm < 0.1 || radiusKm > 500) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "radiusKm must be between 0.1 and 500");
        }

        return publicTourService.getNearbyTours(lat, lng, radiusKm);
    }

    // ── Tour route (trail) ──────────────────────────────────────────────────────

    /**
     * Returns the ordered waypoints (trail) for a tour's next upcoming occurrence.
     * The frontend connects these as a Leaflet.js polyline to draw the route on the map.
     *
     * Example: Jbeil (orderIndex=0) → Byblos Roman Ruins (1) → Beirut Souks (2)
     *
     * Returns 200 with an empty waypoints array if:
     *   - The tour has no upcoming occurrences
     *   - The guide has not set a route for the occurrence yet
     * The frontend simply hides the trail section in those cases.
     *
     * Example: GET /api/public/tours/5/route
     */
    @GetMapping("/tours/{id}/route")
    public TourRouteResponse getTourRoute(@PathVariable Long id) {
        return publicTourService.getTourRoute(id);
    }

    // ── Tour detail ─────────────────────────────────────────────────────────────

    /** Full detail for one published tour. */
    @GetMapping("/tours/{id}")
    public PublicTourDetailResponse getTourDetail(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            org.springframework.security.core.userdetails.UserDetails user) {
        String email = user != null ? user.getUsername() : null;
        return publicTourService.getTourDetail(id, email);
    }

    /**
     * Future active occurrences for a published tour.
     * Includes SCHEDULED and FULL occurrences with start time > now.
     */
    @GetMapping("/tours/{id}/occurrences")
    public List<TourOccurrenceResponse> getTourOccurrences(@PathVariable Long id) {
        return publicTourService.getPublicOccurrences(id);
    }

    // ── Guide portfolio ─────────────────────────────────────────────────────────

    /**
     * A guide's public portfolio — tours that were ever admin-approved.
     * Includes PUBLISHED, PAUSED, and ARCHIVED tours.
     */
    @GetMapping("/guides/{guideId}/tours")
    public List<GuidePortfolioTourResponse> getGuidePortfolio(@PathVariable Long guideId) {
        return publicTourService.getGuidePortfolio(guideId);
    }

    /** Full portfolio detail for one of a guide's tours. */
    @GetMapping("/guides/{guideId}/tours/{tourId}")
    public GuidePortfolioTourDetailResponse getPortfolioTourDetail(
            @PathVariable Long guideId,
            @PathVariable Long tourId) {
        return publicTourService.getPortfolioTourDetail(guideId, tourId);
    }

    /** Public profile lookup for the guide portfolio page. */
    @GetMapping("/guides/{guideId}")
    public PublicGuideProfileResponse getGuideProfile(@PathVariable Long guideId) {
        return publicTourService.getPublicGuideProfile(guideId);
    }

    /** Search for verified guides by name. */
    @GetMapping("/guides/search")
    public List<PublicGuideProfileResponse> searchGuides(@RequestParam("q") String q) {
        return publicTourService.searchGuides(q);
    }

    // ── Private validation helpers ──────────────────────────────────────────────

    /** Validates that a latitude value is within the WGS-84 range [-90, 90]. */
    private void validateLatRange(BigDecimal value, String paramName) {
        if (value.compareTo(BigDecimal.valueOf(-90)) < 0
                || value.compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    paramName + " must be between -90 and 90");
        }
    }

    /** Validates that a longitude value is within the WGS-84 range [-180, 180]. */
    private void validateLngRange(BigDecimal value, String paramName) {
        if (value.compareTo(BigDecimal.valueOf(-180)) < 0
                || value.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    paramName + " must be between -180 and 180");
        }
    }
}