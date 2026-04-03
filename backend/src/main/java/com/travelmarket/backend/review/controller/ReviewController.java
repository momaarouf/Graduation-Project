package com.travelmarket.backend.review.controller;

import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.review.dto.ReviewCreateRequest;
import com.travelmarket.backend.review.dto.ReviewResponse;
import com.travelmarket.backend.review.dto.ReviewSummaryResponse;
import com.travelmarket.backend.review.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Reviews REST controller.
 *
 * URL conventions follow the same role-scoping as BookingController:
 *   /api/traveler/** → authenticated TRAVELER role only  (enforced by SecurityConfig)
 *   /api/reviews/**  → public, no authentication required
 *
 * Auth pattern matches BookingController exactly:
 *   - Controller extracts email from JWT via @AuthenticationPrincipal UserDetails
 *   - Resolves TravelerProfile via travelerRepository.findByUserEmail(email)
 *   - Passes TravelerProfile.id to the service (never User.id for ownership queries)
 *
 * Endpoints:
 *   POST /api/traveler/reviews              → create review (traveler only)
 *   GET  /api/traveler/reviews/my          → my submitted reviews (traveler only)
 *   GET  /api/reviews/guide/{guideId}      → public: reviews for a guide
 *   GET  /api/reviews/tour/{tourId}        → public: reviews for a tour template
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService            reviewService;
    private final TravelerProfileRepository travelerRepository;

    // =========================================================================
    // TRAVELER: CREATE REVIEW
    // =========================================================================

    /**
     * POST /api/traveler/reviews
     *
     * Creates a review for a completed booking owned by the authenticated traveler.
     * SecurityConfig ensures only TRAVELER role reaches this endpoint.
     *
     * Validation enforced in ReviewService (in order):
     *   1. Booking exists                        → 404
     *   2. Booking belongs to this traveler      → 403
     *   3. Booking status == Completed           → 400
     *   4. No review already exists for booking  → 409
     *
     * Request body (@Valid triggers Bean Validation on ReviewCreateRequest):
     *   { "bookingId": 42, "ratingOverall": 5, "ratingGuide": 5,
     *     "ratingTour": 4, "ratingValue": 5, "comment": "Great tour!" }
     *
     * Returns HTTP 201 + the created ReviewResponse.
     */
    @PostMapping("/traveler/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewCreateRequest request) {

        // Resolve TravelerProfile from JWT email — same pattern as BookingService
        TravelerProfile traveler = resolveTraveler(userDetails.getUsername());

        // Pass User.id for the ownership check (JWT principal is User, not TravelerProfile)
        // Service compares this against booking.getTraveler().getUser().getId()
        return reviewService.createReview(
                traveler.getUser().getId(),
                request
        );
    }

    // =========================================================================
    // TRAVELER: MY REVIEWS
    // =========================================================================

    /**
     * GET /api/traveler/reviews/my?page=0&size=10
     *
     * Returns all reviews written by the authenticated traveler, newest first.
     * Includes hidden reviews — the traveler can always see their own.
     *
     * Query params (optional, with sensible defaults):
     *   page → zero-based page index (default: 0)
     *   size → reviews per page (default: 10, max enforced client-side)
     */
    @GetMapping("/traveler/reviews/my")
    public Page<ReviewResponse> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        TravelerProfile traveler = resolveTraveler(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);

        // Service uses TravelerProfile.id (stored in reviews.traveler_id)
        return reviewService.getMyReviews(traveler.getId(), pageable);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A GUIDE
    // =========================================================================

    /**
     * GET /api/reviews/guide/{guideId}?page=0&size=10
     *
     * Public endpoint — no authentication required.
     * Returns aggregated stats + paginated visible reviews for a guide.
     * Hidden reviews are excluded automatically.
     *
     * guideId = GuideProfile.id (the same ID used in /api/public/guides/{id}).
     *
     * Response shape (ReviewSummaryResponse):
     *   {
     *     "averageOverall": 4.8,
     *     "averageGuide":   4.9,
     *     "averageTour":    4.7,
     *     "averageValue":   4.6,
     *     "totalReviews":   42,
     *     "distribution":   { "fiveStar": 30, "fourStar": 10, ... },
     *     "reviews":        { "content": [...], "totalElements": 42, ... }
     *   }
     */
    @GetMapping("/reviews/guide/{guideId}")
    public ReviewSummaryResponse getReviewsForGuide(
            @PathVariable Long guideId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getReviewsForGuide(guideId, pageable);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A TOUR TEMPLATE
    // =========================================================================

    /**
     * GET /api/reviews/tour/{tourId}?page=0&size=10
     *
     * Public endpoint — no authentication required.
     * Returns aggregated stats + paginated visible reviews for a tour template.
     * Hidden reviews are excluded automatically.
     *
     * tourId = TourTemplate.id (the same ID used in /api/public/tours/{id}).
     *
     * This endpoint powers the ReviewList component on the tour detail page.
     * The frontend's getTourReviews() stub should call this URL.
     */
    @GetMapping("/reviews/tour/{tourId}")
    public ReviewSummaryResponse getReviewsForTour(
            @PathVariable Long tourId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getReviewsForTour(tourId, pageable);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Resolves a TravelerProfile from the JWT email.
     * Identical pattern to BookingService.resolveTraveler().
     * Returns 404 if no traveler profile exists for this user.
     */
    private TravelerProfile resolveTraveler(String email) {
        return travelerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Traveler profile not found for: " + email
                ));
    }
}