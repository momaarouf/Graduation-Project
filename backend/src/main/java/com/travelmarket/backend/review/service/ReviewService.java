package com.travelmarket.backend.review.service;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.review.dto.ReviewCreateRequest;
import com.travelmarket.backend.review.dto.ReviewResponse;
import com.travelmarket.backend.review.dto.ReviewSummaryResponse;
import com.travelmarket.backend.review.entity.Review;
import com.travelmarket.backend.review.repository.ReviewRepository;
import com.travelmarket.backend.tour.entity.TourOccurrence;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final BookingRepository bookingRepository;

    // =========================================================================
    // CREATE REVIEW
    // =========================================================================

    /**
     * Create a review for a completed booking.
     *
     * Validation order (fail-fast):
     *   1. Booking exists                        → 404
     *   2. Booking belongs to authenticated user → 403  (ownership)
     *   3. Booking status == Completed           → 400  (eligibility)
     *   4. No review already exists              → 409  (duplicate)
     *
     * ID resolution path (Booking uses @ManyToOne relationships, no raw FK fields):
     *   travelerUserId  : booking → getTraveler() [TravelerProfile] → getUser() → getId()
     *   travelerId      : booking → getTraveler() [TravelerProfile] → getId()
     *   guideId         : booking → getOccurrence() → getTemplate() → getGuide() → getId()
     *   tourTemplateId  : booking → getOccurrence() → getTemplate() → getId()
     *   occurrenceId    : booking → getOccurrence() → getId()
     *
     * These are denormalized onto the Review at write time so aggregation queries
     * (avg rating per guide, avg rating per tour) run without joining through bookings.
     */
    @Transactional
    public ReviewResponse createReview(Long authenticatedUserId,
                                       ReviewCreateRequest request) {

        // ── 1. Booking exists ─────────────────────────────────────────────
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found: " + request.bookingId()
                ));

        // ── 2. OWNERSHIP CHECK ────────────────────────────────────────────
        // JWT principal carries User.id.
        // TravelerProfile → User is a OneToOne: getTraveler().getUser().getId()
        Long bookingOwnerUserId = booking.getTraveler().getUser().getId();
        if (!bookingOwnerUserId.equals(authenticatedUserId)) {
            log.warn("User {} attempted to review booking {} owned by user {}",
                    authenticatedUserId, booking.getId(), bookingOwnerUserId);
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot review another traveler's booking"
            );
        }

        // ── 3. ELIGIBILITY CHECK — must be Completed ──────────────────────
        if (booking.getStatus() != BookingStatus.Completed) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only completed bookings can be reviewed. Current status: "
                            + booking.getStatus()
            );
        }

        // ── 4. DUPLICATE CHECK — one review per booking ───────────────────
        // DB UNIQUE constraint on booking_id is the final safety net.
        // We check here first to return a clean 409 instead of a DB exception.
        if (reviewRepository.existsByBookingId(request.bookingId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already reviewed this booking"
            );
        }

        // ── Resolve denormalized IDs from object graph ────────────────────
        TourOccurrence occurrence = booking.getOccurrence();
        Long occurrenceId    = occurrence.getId();
        Long tourTemplateId  = occurrence.getTemplate().getId();
        // GuideProfile.id — matches what public guide endpoints use as the guide identifier
        Long guideId         = occurrence.getTemplate().getGuide().getId();
        // TravelerProfile.id — stored in reviews.traveler_id for "my reviews" queries
        Long travelerId      = booking.getTraveler().getId();

        // ── Build and save ────────────────────────────────────────────────
        Review review = Review.builder()
                .bookingId(booking.getId())
                .travelerId(travelerId)
                .guideId(guideId)
                .tourTemplateId(tourTemplateId)
                .occurrenceId(occurrenceId)
                // DTO uses Integer (clean API); DB column is SMALLINT → cast to Short
                .ratingOverall(request.ratingOverall().shortValue())
                .ratingGuide(request.ratingGuide().shortValue())
                .ratingTour(request.ratingTour().shortValue())
                .ratingValue(request.ratingValue().shortValue())
                .comment(request.comment())
                .build();
        // createdAt / updatedAt set by @PrePersist on Review entity

        Review saved = reviewRepository.save(review);
        log.info("Review {} created — travelerProfile={}, booking={}, guide={}, tour={}",
                saved.getId(), travelerId, booking.getId(), guideId, tourTemplateId);

        // Return full response using the already-loaded Booking (no extra queries)
        return toResponse(saved, booking);
    }

    // =========================================================================
    // TRAVELER: MY REVIEWS
    // =========================================================================

    /**
     * All reviews written by the authenticated traveler, newest first.
     *
     * travelerProfileId = TravelerProfile.id (not User.id).
     * This must be resolved from the JWT principal in the controller,
     * same pattern as BookingController does for traveler-scoped queries.
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(Long travelerProfileId, Pageable pageable) {
        return reviewRepository
                .findByTravelerIdOrderByCreatedAtDesc(travelerProfileId, pageable)
                .map(this::toResponseMinimal);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A GUIDE
    // =========================================================================

    /**
     * Aggregated stats + paginated visible reviews for a guide.
     * guideId = GuideProfile.id — matches reviews.guide_id.
     * Hidden reviews are excluded automatically by the repository query.
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewsForGuide(Long guideId, Pageable pageable) {
        Page<ReviewResponse> reviews = reviewRepository
                .findByGuideIdAndHiddenFalseOrderByCreatedAtDesc(guideId, pageable)
                .map(this::toResponseMinimal);

        Double avgOverall   = reviewRepository.findAverageOverallRatingByGuideId(guideId);
        Long   total        = reviewRepository.countVisibleReviewsByGuideId(guideId);
        List<Object[]> dist = reviewRepository.findRatingDistributionByGuideId(guideId);

        return buildSummary(avgOverall, total, dist, reviews);
    }

    // =========================================================================
    // PUBLIC: REVIEWS FOR A TOUR TEMPLATE
    // =========================================================================

    /**
     * Aggregated stats + paginated visible reviews for a tour template.
     * tourTemplateId = TourTemplate.id — matches reviews.tour_template_id.
     * Hidden reviews are excluded automatically by the repository query.
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewsForTour(Long tourTemplateId, Pageable pageable) {
        Page<ReviewResponse> reviews = reviewRepository
                .findByTourTemplateIdAndHiddenFalseOrderByCreatedAtDesc(tourTemplateId, pageable)
                .map(this::toResponseMinimal);

        Double avgOverall   = reviewRepository.findAverageOverallRatingByTourTemplateId(tourTemplateId);
        Long   total        = reviewRepository.countVisibleReviewsByTourTemplateId(tourTemplateId);
        List<Object[]> dist = reviewRepository.findRatingDistributionByTourTemplateId(tourTemplateId);

        return buildSummary(avgOverall, total, dist, reviews);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Full response — called right after create() where the Booking is already
     * in memory. Extracts traveler display info and tour context from it without
     * any additional DB queries.
     *
     * Traveler name  : TravelerProfile → User.fullName
     * Traveler avatar: TravelerProfile.avatarUrl  (avatar lives on TravelerProfile, not User)
     * Tour title     : TourOccurrence → TourTemplate.title
     * Tour date      : TourOccurrence.startTimeUtc (when the tour happened, not when review was written)
     */
    private ReviewResponse toResponse(Review review, Booking booking) {
        String  travelerName      = booking.getTraveler().getUser().getFullName();
        String  travelerAvatarUrl = booking.getTraveler().getAvatarUrl();
        String  tourTitle         = booking.getOccurrence().getTemplate().getTitle();
        Instant tourDate          = booking.getOccurrence().getStartTimeUtc();

        return buildReviewResponse(review, travelerName, travelerAvatarUrl, tourTitle, tourDate);
    }

    /**
     * Minimal response — used for listing endpoints where the Booking is not loaded.
     *
     * At this scale, enriching with traveler name / tour title would require
     * N extra queries per page. For a clean first implementation, the listing
     * endpoints return the core review data (ratings, comment, timestamps).
     *
     * To enrich listings in a future iteration, add a JOIN FETCH JPQL query
     * in ReviewRepository that loads the related Booking + TravelerProfile +
     * TourOccurrence + TourTemplate in one query.
     */
    private ReviewResponse toResponseMinimal(Review review) {
        return buildReviewResponse(
                review,
                "Traveler",   // enriched in future JOIN FETCH iteration
                null,
                "Tour",       // enriched in future JOIN FETCH iteration
                review.getCreatedAt()
        );
    }

    /**
     * Shared builder — maps Review entity + enriched display data → ReviewResponse DTO.
     * Short ratings are widened to Integer (SMALLINT in DB, Integer in the API).
     */
    private ReviewResponse buildReviewResponse(Review review,
                                               String travelerName,
                                               String travelerAvatarUrl,
                                               String tourTitle,
                                               Instant tourDate) {
        return new ReviewResponse(
                review.getId(),
                review.getBookingId(),
                review.getTourTemplateId(),
                review.getOccurrenceId(),

                (int) review.getRatingOverall(),   // Short → Integer widening
                (int) review.getRatingGuide(),
                (int) review.getRatingTour(),
                (int) review.getRatingValue(),

                review.getComment(),

                review.getTravelerId(),
                travelerName,
                travelerAvatarUrl,

                tourTitle,
                tourDate,

                review.getGuideReply(),
                review.getGuideRepliedAt(),
                review.getCreatedAt()
        );
    }

    /**
     * Assembles a ReviewSummaryResponse from pre-computed aggregate values.
     *
     * Sub-rating averages (guide/tour/value) are currently derived from the
     * current page's content. This is accurate only within the page scope.
     * For precise global averages, add AVG JPQL queries to ReviewRepository.
     */
    private ReviewSummaryResponse buildSummary(Double avgOverall,
                                               Long total,
                                               List<Object[]> distributionRows,
                                               Page<ReviewResponse> reviews) {
        long safeTotal = total != null ? total : 0L;

        ReviewSummaryResponse.Distribution dist = safeTotal == 0
                ? ReviewSummaryResponse.Distribution.empty()
                : ReviewSummaryResponse.Distribution.from(distributionRows);

        double avgGuide = reviews.getContent().stream()
                .mapToInt(ReviewResponse::ratingGuide).average().orElse(0.0);
        double avgTour  = reviews.getContent().stream()
                .mapToInt(ReviewResponse::ratingTour).average().orElse(0.0);
        double avgValue = reviews.getContent().stream()
                .mapToInt(ReviewResponse::ratingValue).average().orElse(0.0);

        return new ReviewSummaryResponse(
                avgOverall,
                avgGuide,
                avgTour,
                avgValue,
                safeTotal,
                dist,
                reviews
        );
    }
}