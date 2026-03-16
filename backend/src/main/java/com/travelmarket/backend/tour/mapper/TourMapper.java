package com.travelmarket.backend.tour.mapper;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Central mapping component for all tour-related entity → DTO conversions.
 *
 * Rules:
 *  - Never expose internal fields (status REJECTED/PENDING_REVIEW on public endpoints,
 *    rejectionReason, lastPublishedAtUtc raw details, guide profile internals).
 *  - All public-facing methods receive pre-loaded data to avoid lazy-load issues.
 *  - Null-safe throughout — missing optional fields produce null, not exceptions.
 */
@Component
public class TourMapper {

    // ── Media ──────────────────────────────────────────────────────────────────

    public TourMediaResponse toMediaResponse(TourMedia media) {
        if (media == null) return null;
        TourMediaResponse r = new TourMediaResponse();
        r.setId(media.getId());
        r.setMediaType(media.getMediaType() != null ? media.getMediaType().name() : null);
        r.setUrl(media.getUrl());
        r.setDisplayOrder(media.getDisplayOrder());
        return r;
    }

    public List<TourMediaResponse> toMediaResponseList(List<TourMedia> mediaList) {
        if (mediaList == null) return Collections.emptyList();
        return mediaList.stream().map(this::toMediaResponse).collect(Collectors.toList());
    }

    /**
     * Extracts the cover image URL from an ordered media list.
     * The first item (lowest displayOrder) is the cover.
     * Returns null if no media exists.
     */
    public String extractCoverImageUrl(List<TourMedia> mediaList) {
        if (mediaList == null || mediaList.isEmpty()) return null;
        return mediaList.get(0).getUrl();
    }

    // ── Occurrence ─────────────────────────────────────────────────────────────

    public TourOccurrenceResponse toOccurrenceResponse(TourOccurrence o) {
        if (o == null) return null;
        TourOccurrenceResponse r = new TourOccurrenceResponse();
        r.setId(o.getId());
        r.setTemplateId(o.getTemplate() != null ? o.getTemplate().getId() : null);
        r.setStartTimeUtc(o.getStartTimeUtc());
        r.setEndTimeUtc(o.getEndTimeUtc());
        r.setStatus(o.getStatus() != null ? o.getStatus().name() : null);
        r.setSeatsReserved(o.getSeatsReserved());
        r.setCreatedAtUtc(o.getCreatedAtUtc());
        r.setUpdatedAtUtc(o.getUpdatedAtUtc());

        // Compute available seats from template capacity if template is loaded
        if (o.getTemplate() != null && o.getTemplate().getMaxCapacity() != null) {
            int max = o.getTemplate().getMaxCapacity();
            int reserved = o.getSeatsReserved() != null ? o.getSeatsReserved() : 0;
            r.setMaxCapacity(max);
            r.setAvailableSeats(Math.max(0, max - reserved));
        }

        return r;
    }

    public List<TourOccurrenceResponse> toOccurrenceResponseList(List<TourOccurrence> occurrences) {
        if (occurrences == null) return Collections.emptyList();
        return occurrences.stream().map(this::toOccurrenceResponse).collect(Collectors.toList());
    }

    // ── Guide tour (private — for the owning guide) ────────────────────────────

    /**
     * Full tour response for the guide's own dashboard.
     * Includes status, rejectionReason, and all admin-review fields.
     * Never returned by public endpoints.
     */
    public TourTemplateResponse toTemplateResponse(TourTemplate t, List<TourMedia> media) {
        if (t == null) return null;
        TourTemplateResponse r = new TourTemplateResponse();

        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setMeetingLatitude(t.getMeetingLatitude());
        r.setMeetingLongitude(t.getMeetingLongitude());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setInstantBook(t.getInstantBook());
        r.setIsRecurring(t.getIsRecurring());
        r.setRecurrencePattern(t.getRecurrencePattern() != null ? t.getRecurrencePattern().name() : null);
        r.setHalalFriendly(t.getHalalFriendly());
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setIsActive(t.getIsActive());
        r.setRejectionReason(t.getRejectionReason());    // guide sees admin feedback
        r.setShowInPortfolio(t.getShowInPortfolio());
        r.setAutoCancelIfMinNotMet(t.getAutoCancelIfMinNotMet());
        r.setMedia(toMediaResponseList(media));
        r.setCreatedAtUtc(t.getCreatedAtUtc());
        r.setUpdatedAtUtc(t.getUpdatedAtUtc());
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());

        return r;
    }

    // ── Public listing card ────────────────────────────────────────────────────

    /**
     * Lightweight card for the public browse listing.
     * Does NOT include: description, meeting coordinates, capacity, media gallery,
     * occurrences list, status, rejection reason, or any admin fields.
     *
     * @param t          the tour template
     * @param guide      the GuideProfile (to access guide name and verified flag)
     * @param guideUser  the User linked to the guide (for display name)
     * @param media      ordered media list — only first item is used for cover
     * @param nextOccurrence  earliest future SCHEDULED occurrence, or null
     */
    public PublicTourCardResponse toPublicCardResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            TourOccurrence nextOccurrence
    ) {
        if (t == null) return null;
        PublicTourCardResponse r = new PublicTourCardResponse();

        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCountryCode(t.getCountryCode());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setInstantBook(t.getInstantBook());

        // Guide info
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);

        // Cover image only
        r.setCoverImageUrl(extractCoverImageUrl(media));

        // Next occurrence start time
        r.setNextOccurrenceStartUtc(nextOccurrence != null ? nextOccurrence.getStartTimeUtc() : null);

        // Reviews — null until implemented
        r.setAverageRating(null);
        r.setReviewCount(null);

        return r;
    }

    // ── Public tour detail ─────────────────────────────────────────────────────

    /**
     * Full detail for the public tour detail page.
     *
     * @param t           the tour template
     * @param guide       the GuideProfile
     * @param guideUser   the User linked to the guide
     * @param media       full ordered media list
     * @param occurrences future active occurrences (SCHEDULED or FULL, start > now)
     */
    public PublicTourDetailResponse toPublicDetailResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            List<TourOccurrence> occurrences
    ) {
        if (t == null) return null;
        PublicTourDetailResponse r = new PublicTourDetailResponse();

        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setMeetingLatitude(t.getMeetingLatitude());
        r.setMeetingLongitude(t.getMeetingLongitude());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setInstantBook(t.getInstantBook());
        r.setIsRecurring(t.getIsRecurring());
        r.setRecurrencePattern(t.getRecurrencePattern() != null ? t.getRecurrencePattern().name() : null);
        r.setHalalFriendly(t.getHalalFriendly());

        // Guide info
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);

        r.setMedia(toMediaResponseList(media));
        r.setOccurrences(toOccurrenceResponseList(occurrences));

        // Reviews — null until implemented
        r.setAverageRating(null);
        r.setReviewCount(null);

        return r;
    }

    // ── Portfolio card ─────────────────────────────────────────────────────────

    /**
     * Portfolio card for one tour in the guide's public portfolio list.
     *
     * @param t                  the tour template
     * @param media              ordered media list — only cover used
     * @param completedRunCount  count of COMPLETED occurrences
     * @param totalTravelers     sum of seats_reserved across completed occurrences
     */
    public GuidePortfolioTourResponse toPortfolioCardResponse(
            TourTemplate t,
            List<TourMedia> media,
            int completedRunCount,
            int totalTravelers
    ) {
        if (t == null) return null;
        GuidePortfolioTourResponse r = new GuidePortfolioTourResponse();

        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setCoverImageUrl(extractCoverImageUrl(media));
        r.setCompletedRunCount(completedRunCount);
        r.setTotalTravelersCount(totalTravelers);
        r.setAverageRating(null);   // null until reviews implemented
        r.setReviewCount(null);
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setCurrentlyAvailable(t.getStatus() == TourTemplateStatus.PUBLISHED);
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());

        return r;
    }

    // ── Portfolio detail ───────────────────────────────────────────────────────

    /**
     * Full portfolio detail — the professional case-study view.
     *
     * @param t                   the tour template
     * @param guide               the GuideProfile
     * @param guideUser           the User linked to the guide
     * @param media               full ordered media list
     * @param completedOccurrences list of COMPLETED occurrences ordered newest first
     * @param relatedPublishedId  ID of the current live version of this tour, or null
     */
    public GuidePortfolioTourDetailResponse toPortfolioDetailResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            List<TourOccurrence> completedOccurrences,
            Long relatedPublishedId
    ) {
        if (t == null) return null;
        GuidePortfolioTourDetailResponse r = new GuidePortfolioTourDetailResponse();

        r.setId(t.getId());
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setInstantBook(t.getInstantBook());
        r.setMedia(toMediaResponseList(media));
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setCurrentlyAvailable(t.getStatus() == TourTemplateStatus.PUBLISHED);
        r.setRelatedPublishedTourId(relatedPublishedId);
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());

        // Build aggregate stats and run history from completed occurrences
        int totalTravelers = 0;
        List<GuidePortfolioTourDetailResponse.CompletedRunSummary> runs = new java.util.ArrayList<>();

        for (TourOccurrence o : completedOccurrences) {
            int attendees = o.getSeatsReserved() != null ? o.getSeatsReserved() : 0;
            totalTravelers += attendees;

            GuidePortfolioTourDetailResponse.CompletedRunSummary run =
                    new GuidePortfolioTourDetailResponse.CompletedRunSummary();
            run.setOccurrenceId(o.getId());
            run.setStartTimeUtc(o.getStartTimeUtc());
            run.setEndTimeUtc(o.getEndTimeUtc());
            run.setAttendeeCount(attendees);
            runs.add(run);
        }

        r.setCompletedRunCount(completedOccurrences.size());
        r.setTotalTravelersCount(totalTravelers);
        r.setAverageRating(null);   // null until reviews implemented
        r.setReviewCount(null);
        r.setCompletedRuns(runs);

        return r;
    }
}