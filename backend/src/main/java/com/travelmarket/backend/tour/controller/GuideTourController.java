package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.request.CreateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.CreateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.request.UpdateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.UpdateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.response.TourOccurrenceResponse;
import com.travelmarket.backend.tour.dto.response.TourTemplateResponse;
import com.travelmarket.backend.tour.service.TourOccurrenceService;
import com.travelmarket.backend.tour.service.TourTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Guide-facing tour and occurrence management.
 * All endpoints require ROLE_Guide (enforced in SecurityConfig).
 *
 * Tour lifecycle endpoints:
 *   POST   /api/guide/tours                          create
 *   GET    /api/guide/tours                          list own tours
 *   GET    /api/guide/tours/{id}                     get one
 *   PUT    /api/guide/tours/{id}                     update
 *   DELETE /api/guide/tours/{id}                     soft delete
 *   POST   /api/guide/tours/{id}/submit              DRAFT/REJECTED → PENDING_REVIEW
 *   POST   /api/guide/tours/{id}/withdraw            PENDING_REVIEW → DRAFT
 *   POST   /api/guide/tours/{id}/pause               PUBLISHED → PAUSED
 *   POST   /api/guide/tours/{id}/archive             PUBLISHED/PAUSED → ARCHIVED
 *
 * Occurrence endpoints:
 *   POST   /api/guide/tours/{id}/occurrences         create
 *   GET    /api/guide/tours/{id}/occurrences         list
 *   PUT    /api/guide/occurrences/{occurrenceId}     update
 *   DELETE /api/guide/occurrences/{occurrenceId}     soft delete
 */
@RestController
@RequestMapping("/api/guide")
@RequiredArgsConstructor
public class GuideTourController {

    private final TourTemplateService tourTemplateService;
    private final TourOccurrenceService tourOccurrenceService;

    // ── Tours ───────────────────────────────────────────────────────────────────

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

    // ── Tour status transitions ─────────────────────────────────────────────────

    /** Submit a DRAFT or REJECTED tour for admin review. */
    @PostMapping("/tours/{id}/submit")
    public TourTemplateResponse submitForReview(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.submitForReview(auth.getName(), id);
    }

    /** Withdraw a PENDING_REVIEW tour back to DRAFT for further editing. */
    @PostMapping("/tours/{id}/withdraw")
    public TourTemplateResponse withdrawFromReview(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.withdrawFromReview(auth.getName(), id);
    }

    /** Temporarily pause a PUBLISHED tour (hides from public listings). */
    @PostMapping("/tours/{id}/pause")
    public TourTemplateResponse pauseTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.pauseTour(auth.getName(), id);
    }

    /** Permanently archive a PUBLISHED or PAUSED tour (terminal state). */
    @PostMapping("/tours/{id}/archive")
    public TourTemplateResponse archiveTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.archiveTour(auth.getName(), id);
    }

    // ── Occurrences ─────────────────────────────────────────────────────────────

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

    /** Update an occurrence by its own ID (not scoped to templateId in the path). */
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
}