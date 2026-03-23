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

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/guide")
@RequiredArgsConstructor
public class GuideTourController {

    private final TourTemplateService tourTemplateService;
    private final TourOccurrenceService tourOccurrenceService;

    @DeleteMapping("/occurrences/{occurrenceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOccurrence(Authentication auth, @PathVariable Long occurrenceId) {
        tourOccurrenceService.deleteOccurrence(auth.getName(), occurrenceId);
    }

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

    private Instant parseResilient(String d) {
        if (d == null || d.isBlank()) return null;
        String clean = d.trim();
        if (clean.contains("T") && !clean.endsWith("Z") && !clean.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            clean += "Z";
        }
        return Instant.parse(clean);
    }
}
