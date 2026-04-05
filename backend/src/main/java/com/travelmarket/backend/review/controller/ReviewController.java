package com.travelmarket.backend.review.controller;

import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.review.dto.ReviewCreateRequest;
import com.travelmarket.backend.review.dto.ReviewResponse;
import com.travelmarket.backend.review.dto.ReviewSummaryResponse;
import com.travelmarket.backend.review.dto.ToggleHelpfulResponse;
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
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService            reviewService;
    private final TravelerProfileRepository travelerRepository;
    private final UserRepository          userRepository;

    // =========================================================================
    // TRAVELER: CREATE REVIEW
    // =========================================================================

    @PostMapping("/traveler/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewCreateRequest request) {

        TravelerProfile traveler = resolveTraveler(userDetails.getUsername());
        return reviewService.createReview(traveler.getUser().getId(), request);
    }

    // =========================================================================
    // TRAVELER: MY REVIEWS
    // =========================================================================

    @GetMapping("/traveler/reviews/my")
    public Page<ReviewResponse> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        TravelerProfile traveler = resolveTraveler(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);
        return reviewService.getMyReviews(traveler.getId(), pageable);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A GUIDE
    // =========================================================================

    @GetMapping("/reviews/guide/{guideId}")
    public ReviewSummaryResponse getReviewsForGuide(
            @PathVariable Long guideId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false)    Integer rating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Long currentUserId = resolveOptionalUserId(userDetails);
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return reviewService.getReviewsForGuide(guideId, currentUserId, rating, pageable);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A TOUR TEMPLATE
    // =========================================================================

    @GetMapping("/reviews/tour/{tourId}")
    public ReviewSummaryResponse getReviewsForTour(
            @PathVariable Long tourId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false)    Integer rating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Long currentUserId = resolveOptionalUserId(userDetails);
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return reviewService.getReviewsForTour(tourId, currentUserId, rating, pageable);
    }

    // =========================================================================
    // ENGAGEMENT: HELPFUL VOTES & REPLIES
    // =========================================================================

    @PostMapping("/reviews/{id}/helpful")
    public ToggleHelpfulResponse toggleHelpful(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        Long userId = resolveUserId(userDetails.getUsername());
        return reviewService.toggleHelpfulVote(id, userId);
    }

    @PostMapping("/reviews/{id}/reply")
    public ReviewResponse replyToReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody String reply) {
        
        if (userDetails == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        Long userId = resolveUserId(userDetails.getUsername());
        return reviewService.replyToReview(id, userId, reply);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private TravelerProfile resolveTraveler(String email) {
        return travelerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Traveler profile not found for: " + email
                ));
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(com.travelmarket.backend.entity.User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Long resolveOptionalUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .map(com.travelmarket.backend.entity.User::getId)
                .orElse(null);
    }

    private org.springframework.data.domain.Sort resolveSort(String sort) {
        if (sort == null) return org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        return switch (sort.toLowerCase().trim()) {
            case "highest" -> org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "ratingOverall");
            case "lowest"  -> org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "ratingOverall");
            default        -> org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt");
        };
    }
}