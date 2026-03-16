package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.service.PublicTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public tour browsing and guide portfolio endpoints.
 * No authentication required (permitAll in SecurityConfig).
 *
 *   GET /api/public/tours                            browse listing with filters
 *   GET /api/public/tours/{id}                       tour detail
 *   GET /api/public/tours/{id}/occurrences           future active occurrences
 *   GET /api/public/guides/{guideId}/tours           guide portfolio list
 *   GET /api/public/guides/{guideId}/tours/{tourId}  portfolio tour detail
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicTourController {

    private final PublicTourService publicTourService;

    // ── Tour listing ────────────────────────────────────────────────────────────

    /**
     * Public tour browse with optional filters.
     * All filter params are optional — omit to return all published tours.
     *
     * Query params:
     *   region        - exact region name (case-insensitive)
     *   category      - exact category name (case-insensitive)
     *   halalFriendly - true/false
     *   instantBook   - true/false
     *   minPrice      - minimum base price (inclusive)
     *   maxPrice      - maximum base price (inclusive)
     */
    @GetMapping("/tours")
    public List<PublicTourCardResponse> listTours(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean halalFriendly,
            @RequestParam(required = false) Boolean instantBook,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {

        return publicTourService.listTours(
                region, category, halalFriendly, instantBook, minPrice, maxPrice);
    }

    /** Full detail for one published tour. */
    @GetMapping("/tours/{id}")
    public PublicTourDetailResponse getTourDetail(@PathVariable Long id) {
        return publicTourService.getTourDetail(id);
    }

    /**
     * Future active occurrences for a published tour.
     * Includes SCHEDULED and FULL occurrences with start time > now.
     * Occurrences remain visible if the guide is editing (re-review in progress).
     */
    @GetMapping("/tours/{id}/occurrences")
    public List<TourOccurrenceResponse> getTourOccurrences(@PathVariable Long id) {
        return publicTourService.getPublicOccurrences(id);
    }

    // ── Guide portfolio ─────────────────────────────────────────────────────────

    /**
     * A guide's public portfolio — their body of completed and active work.
     * Shows tours that were ever admin-approved and not opted out of portfolio.
     * Includes PUBLISHED, PAUSED, and ARCHIVED tours.
     */
    @GetMapping("/guides/{guideId}/tours")
    public List<GuidePortfolioTourResponse> getGuidePortfolio(@PathVariable Long guideId) {
        return publicTourService.getGuidePortfolio(guideId);
    }

    /**
     * Full portfolio detail for one of a guide's tours.
     * Shows the professional case-study view with run history,
     * total travelers, and media gallery.
     */
    @GetMapping("/guides/{guideId}/tours/{tourId}")
    public GuidePortfolioTourDetailResponse getPortfolioTourDetail(
            @PathVariable Long guideId,
            @PathVariable Long tourId) {
        return publicTourService.getPortfolioTourDetail(guideId, tourId);
    }
}