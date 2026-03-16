package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourMediaRepository;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicTourService {

    private final TourTemplateRepository tourTemplateRepository;
    private final TourOccurrenceRepository occurrenceRepository;
    private final TourMediaRepository tourMediaRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;
    private final TourMapper tourMapper;

    // ── Internal helpers ────────────────────────────────────────────────────────

    /**
     * Resolves a GuideProfile and its linked User together.
     * Used to populate guide name and verified status on public responses.
     */
    private GuideProfileWithUser resolveGuideWithUser(GuideProfile guide) {
        User user = userRepository.findById(guide.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Guide user data missing"));
        return new GuideProfileWithUser(guide, user);
    }

    private record GuideProfileWithUser(GuideProfile guide, User user) {}

    // ── Public: Tour listing ────────────────────────────────────────────────────

    /**
     * Public tour browse listing with optional filters.
     * Only PUBLISHED, non-deleted templates are returned.
     *
     * For each result:
     *  - cover image: first media item by display_order
     *  - nextOccurrenceStartUtc: earliest future SCHEDULED occurrence
     *  - averageRating / reviewCount: null until review system is implemented
     */
    public List<PublicTourCardResponse> listTours(
            String region,
            String category,
            Boolean halalFriendly,
            Boolean instantBook,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        // Pre-lowercase string filters so the JPQL LOWER(t.region) = :region
        // comparison works correctly without calling LOWER() on the nullable parameter
        // (PostgreSQL cannot infer the type of a null parameter passed to LOWER()).
        String regionFilter   = region   != null ? region.toLowerCase()   : null;
        String categoryFilter = category != null ? category.toLowerCase() : null;

        List<TourTemplate> templates = tourTemplateRepository.findPublishedWithFilters(
                regionFilter, categoryFilter, halalFriendly, instantBook, minPrice, maxPrice);

        Instant now = Instant.now();
        List<PublicTourCardResponse> results = new ArrayList<>();

        for (TourTemplate t : templates) {
            GuideProfile guide = t.getGuide();
            User guideUser = userRepository.findById(guide.getUser().getId()).orElse(null);

            // Cover image only (first by display_order)
            List<TourMedia> media = tourMediaRepository.findCoverByTemplateId(t.getId());

            // Next scheduled occurrence
            List<TourOccurrence> upcoming = occurrenceRepository
                    .findNextScheduledByTemplateId(t.getId(), now);
            TourOccurrence next = upcoming.isEmpty() ? null : upcoming.get(0);

            results.add(tourMapper.toPublicCardResponse(t, guide, guideUser, media, next));
        }

        return results;
    }

    // ── Public: Tour detail ─────────────────────────────────────────────────────

    /**
     * Full detail for one published tour.
     * Returns full media gallery and all future active occurrences.
     */
    public PublicTourDetailResponse getTourDetail(Long id) {
        TourTemplate t = tourTemplateRepository.findPublishedById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found"));

        GuideProfile guide = t.getGuide();
        User guideUser = userRepository.findById(guide.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Guide user data missing"));

        List<TourMedia> media = tourMediaRepository.findAllByTemplateIdOrdered(t.getId());
        List<TourOccurrence> occurrences = occurrenceRepository
                .findPublicFutureByTemplateId(t.getId(), Instant.now());

        return tourMapper.toPublicDetailResponse(t, guide, guideUser, media, occurrences);
    }

    // ── Public: Occurrences for a tour ──────────────────────────────────────────

    /**
     * Future active occurrences for a published tour.
     *
     * Visibility rule (enforced in repository):
     *  - Template must have last_published_at_utc IS NOT NULL
     *    This keeps occurrences visible while the guide re-edits a live tour
     *    (template status may temporarily be PENDING_REVIEW).
     *  - Occurrence status: SCHEDULED or FULL
     *  - start_time_utc > now
     */
    public List<TourOccurrenceResponse> getPublicOccurrences(Long templateId) {
        // Verify the template exists and was ever published
        // (lastPublishedAtUtc check is in the repository query itself)
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(templateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found"));

        if (t.getLastPublishedAtUtc() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        List<TourOccurrence> occurrences = occurrenceRepository
                .findPublicFutureByTemplateId(templateId, Instant.now());

        return occurrences.stream()
                .map(tourMapper::toOccurrenceResponse)
                .toList();
    }

    // ── Public: Guide portfolio list ────────────────────────────────────────────

    /**
     * A guide's public portfolio — all tours they've ever had published
     * and chosen to show, regardless of current template status.
     *
     * Each card shows completed run count and total travelers
     * (evidence of real delivery, not just claims).
     */
    public List<GuidePortfolioTourResponse> getGuidePortfolio(Long guideId) {
        GuideProfile guide = guideProfileRepository.findById(guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Guide not found"));

        List<TourTemplate> portfolioTours =
                tourTemplateRepository.findPortfolioByGuideId(guideId);

        List<GuidePortfolioTourResponse> results = new ArrayList<>();

        for (TourTemplate t : portfolioTours) {
            List<TourMedia> media = tourMediaRepository.findCoverByTemplateId(t.getId());
            List<TourOccurrence> completed = occurrenceRepository.findCompletedByTemplateId(t.getId());

            int runCount = completed.size();
            int totalTravelers = completed.stream()
                    .mapToInt(o -> o.getSeatsReserved() != null ? o.getSeatsReserved() : 0)
                    .sum();

            results.add(tourMapper.toPortfolioCardResponse(t, media, runCount, totalTravelers));
        }

        return results;
    }

    // ── Public: Guide portfolio tour detail ─────────────────────────────────────

    /**
     * Full portfolio detail for one tour — the professional case-study view.
     *
     * Shows:
     *  - Full description and media gallery
     *  - Aggregate track record (total runs, total travelers)
     *  - Individual run history with dates and attendee counts
     *  - relatedPublishedTourId: if the guide currently has a live published
     *    version of this same tour (same id and PUBLISHED status), point to it
     *    so the frontend can show "Book Now"
     */
    public GuidePortfolioTourDetailResponse getPortfolioTourDetail(Long guideId, Long tourId) {
        GuideProfile guide = guideProfileRepository.findById(guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Guide not found"));

        User guideUser = userRepository.findById(guide.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Guide user data missing"));

        TourTemplate t = tourTemplateRepository.findPortfolioTourByIdAndGuideId(tourId, guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found in portfolio"));

        List<TourMedia> media = tourMediaRepository.findAllByTemplateIdOrdered(t.getId());
        List<TourOccurrence> completed = occurrenceRepository.findCompletedByTemplateId(t.getId());

        // If this tour is currently published, point the frontend to it for booking
        Long relatedPublishedId = (t.getStatus() == TourTemplateStatus.PUBLISHED)
                ? t.getId() : null;

        return tourMapper.toPortfolioDetailResponse(
                t, guide, guideUser, media, completed, relatedPublishedId);
    }
}