package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.request.AdminRejectTourRequest;
import com.travelmarket.backend.tour.dto.response.TourTemplateResponse;
import com.travelmarket.backend.tour.service.TourTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-facing tour review and moderation endpoints.
 * All endpoints require ROLE_Admin (enforced in SecurityConfig).
 *
 *   GET  /api/admin/tours/pending        list all tours awaiting review
 *   POST /api/admin/tours/{id}/approve   approve → PUBLISHED
 *   POST /api/admin/tours/{id}/reject    reject → REJECTED (with reason)
 */
@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
public class AdminTourController {

    private final TourTemplateService tourTemplateService;

    /** All tours currently awaiting admin approval, oldest-first. */
    @GetMapping("/pending")
    public List<TourTemplateResponse> getPendingTours() {
        return tourTemplateService.getPendingTours();
    }

    /** Approve a PENDING_REVIEW tour — publishes it immediately. */
    @PostMapping("/{id}/approve")
    public TourTemplateResponse approveTour(Authentication auth, @PathVariable Long id) {
        return tourTemplateService.approveTour(auth.getName(), id);
    }

    /**
     * Reject a PENDING_REVIEW tour with a mandatory written reason.
     * The guide sees this reason and can edit + resubmit.
     */
    @PostMapping("/{id}/reject")
    public TourTemplateResponse rejectTour(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody AdminRejectTourRequest req) {
        return tourTemplateService.rejectTour(auth.getName(), id, req.getRejectionReason());
    }
}