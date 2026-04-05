package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.request.CreateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.CreateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.request.SetTourRouteRequest;
import com.travelmarket.backend.tour.dto.request.UpdateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.UpdateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.response.TourOccurrenceResponse;
import com.travelmarket.backend.tour.dto.response.TourRouteResponse;
import com.travelmarket.backend.tour.dto.response.TourTemplateResponse;
import com.travelmarket.backend.tour.service.TourOccurrenceService;
import com.travelmarket.backend.tour.service.TourTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * Guide tour and occurrence management endpoints.
 * All endpoints require GUIDE role (enforced by SecurityConfig /api/guide/** matcher).
 *
 * Existing endpoints (unchanged):
 *   POST   /api/guide/tours                              create tour
 *   GET    /api/guide/tours                              list my tours
 *   GET    /api/guide/tours/{id}                         get one tour
 *   PUT    /api/guide/tours/{id}                         update tour
 *   DELETE /api/guide/tours/{id}                         soft-delete tour
 *   POST   /api/guide/tours/{id}/submit                  submit for admin review
 *   POST   /api/guide/tours/{id}/withdraw                withdraw from review
 *   POST   /api/guide/tours/{id}/pause                   pause tour
 *   POST   /api/guide/tours/{id}/resume                  resume tour
 *   POST   /api/guide/tours/{id}/archive                 archive tour
 *   POST   /api/guide/tours/{id}/publish-immediately     dev-only: bypass review
 *   POST   /api/guide/tours/{id}/occurrences             create occurrence
 *   GET    /api/guide/tours/{id}/occurrences             list occurrences
 *   PUT    /api/guide/occurrences/{occurrenceId}         update occurrence
 *   DELETE /api/guide/occurrences/{occurrenceId}         soft-delete occurrence
 *
 * New geo endpoint:
 *   PUT    /api/guide/occurrences/{occurrenceId}/route   set/replace trail waypoints
 */
@RestController
@RequestMapping("/api/guide")
@RequiredArgsConstructor
public class GuideTourController {

    private final TourTemplateService   tourTemplateService;
    private final TourOccurrenceService tourOccurrenceService;

    // ── Tour CRUD ───────────────────────────────────────────────────────────────

    @PostMapping("/tours")
    @ResponseStatus(HttpStatus.CREATED)
    public TourTemplateResponse createTour(
            Authentication auth,
            @Valid @RequestBody CreateTourTemplateRequest req) {
        return tourTemplateService.createTour(auth.getName(), req);
    }

    @GetMapping("/tours")
    public List<TourTemplateResponse> listTours(Authentication auth) {
        return tourTemplateService.getGuideTours(auth.getName());
    }

    @GetMapping("/tours/{id}")
    public TourTemplateResponse getTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.getGuideTour(auth.getName(), id);
    }

    @PutMapping("/tours/{id}")
    public TourTemplateResponse updateTour(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTourTemplateRequest req) {
        return tourTemplateService.updateTour(auth.getName(), id, req);
    }

    @DeleteMapping("/tours/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTour(Authentication auth, @PathVariable Long id) {
        tourTemplateService.deleteTour(auth.getName(), id);
    }

    // ── Tour lifecycle ──────────────────────────────────────────────────────────

    @PostMapping("/tours/{id}/submit")
    public TourTemplateResponse submitForReview(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.submitForReview(auth.getName(), id);
    }

    @PostMapping("/tours/{id}/withdraw")
    public TourTemplateResponse withdrawFromReview(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.withdrawFromReview(auth.getName(), id);
    }

    @PostMapping("/tours/{id}/pause")
    public TourTemplateResponse pauseTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.pauseTour(auth.getName(), id);
    }

    @PostMapping("/tours/{id}/resume")
    public TourTemplateResponse resumeTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.resumeTour(auth.getName(), id);
    }

    @PostMapping("/tours/{id}/archive")
    public TourTemplateResponse archiveTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.archiveTour(auth.getName(), id);
    }

    @PostMapping("/tours/{id}/publish-immediately")
    public TourTemplateResponse publishImmediately(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.publishTourImmediately(auth.getName(), id);
    }

    // ── Occurrence CRUD ─────────────────────────────────────────────────────────

    @PostMapping("/tours/{id}/occurrences")
    @ResponseStatus(HttpStatus.CREATED)
    public TourOccurrenceResponse createOccurrence(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody CreateOccurrenceRequest req) {
        return tourOccurrenceService.createOccurrence(auth.getName(), id, req);
    }

    @GetMapping("/tours/{id}/occurrences")
    public List<TourOccurrenceResponse> listOccurrences(
            Authentication auth,
            @PathVariable Long id) {
        return tourOccurrenceService.getGuideOccurrences(auth.getName(), id);
    }

    @PutMapping("/occurrences/{occurrenceId}")
    public TourOccurrenceResponse updateOccurrence(
            Authentication auth,
            @PathVariable Long occurrenceId,
            @Valid @RequestBody UpdateOccurrenceRequest req) {
        return tourOccurrenceService.updateOccurrence(auth.getName(), occurrenceId, req);
    }

    @DeleteMapping("/occurrences/{occurrenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOccurrence(Authentication auth, @PathVariable Long occurrenceId) {
        tourOccurrenceService.deleteOccurrence(auth.getName(), occurrenceId);
    }

    // ── Route (trail) ───────────────────────────────────────────────────────────

    /**
     * Set or replace the ordered waypoints (trail) for a specific occurrence.
     *
     * The guide provides an ordered list of lat/lng points that define the
     * tour route. The frontend will render these as a Leaflet.js polyline
     * on the map (e.g. Jbeil → Byblos ruins → Beirut Souks).
     *
     * The entire route is replaced atomically — all existing waypoints for
     * this occurrence are deleted and the new list is saved in one transaction.
     *
     * Validation:
     *   - Minimum 2 waypoints (start + end)           → 400
     *   - orderIndex must be unique within the list   → 400
     *   - lat: -90 to 90, lng: -180 to 180            → 400
     *   - pointName max 255 characters                → 400
     *   - Occurrence must belong to this guide        → 403
     *
     * Returns the saved route immediately (same shape as GET /api/public/tours/{id}/route).
     *
     * Example request body:
     * {
     *   "waypoints": [
     *     { "latitude": 34.1234, "longitude": 35.6519, "orderIndex": 0, "pointName": "Start: Jbeil" },
     *     { "latitude": 34.0954, "longitude": 35.6433, "orderIndex": 1, "pointName": "Byblos Roman Ruins" },
     *     { "latitude": 33.8938, "longitude": 35.5018, "orderIndex": 2, "pointName": "End: Beirut Souks" }
     *   ]
     * }
     */
    @PutMapping("/occurrences/{occurrenceId}/route")
    public TourRouteResponse setTourRoute(
            Authentication auth,
            @PathVariable Long occurrenceId,
            @Valid @RequestBody SetTourRouteRequest request) {
        return tourOccurrenceService.setTourRoute(occurrenceId, auth.getName(), request);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private Instant parseResilient(String d) {
        if (d == null || d.isBlank()) return null;
        String clean = d.trim();
        if (clean.contains("T") && !clean.endsWith("Z") && !clean.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            clean += "Z";
        }
        return Instant.parse(clean);
    }
}