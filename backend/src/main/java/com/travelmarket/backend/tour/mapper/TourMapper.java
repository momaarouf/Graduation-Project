package com.travelmarket.backend.tour.mapper;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TourMapper {
    private final ObjectMapper objectMapper;

    public TourMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

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

    public String extractCoverImageUrl(List<TourMedia> mediaList) {
        if (mediaList == null || mediaList.isEmpty()) return null;
        return mediaList.get(0).getUrl();
    }

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
        r.setCity(t.getCity());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setMeetingLatitude(t.getMeetingLatitude());
        r.setMeetingLongitude(t.getMeetingLongitude());
        r.setMeetingPointAddress(t.getMeetingPointAddress());
        r.setMeetingPointInstructions(t.getMeetingPointInstructions());
        r.setItinerary(t.getItinerary());
        r.setInclusions(t.getInclusions());
        r.setExclusions(t.getExclusions());
        r.setRequirements(t.getRequirements());
        r.setWhatToBring(t.getWhatToBring());
        r.setTags(t.getTags());
        r.setLanguages(t.getLanguages());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setDurationHours(t.getDurationHours());
        r.setDurationMinutes(t.getDurationMinutes());
        r.setInstantBook(t.getInstantBook());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setAverageRating(t.getAverageRating());
        r.setReviewCount(t.getReviewCount());
        r.setIsPremium(t.getIsPremium());
        r.setIsFamilyFriendly(t.getIsFamilyFriendly());
        r.setHasGroupDiscount(t.getHasGroupDiscount());
        r.setGroupDiscountThreshold(t.getGroupDiscountThreshold());
        r.setGroupDiscountPercent(t.getGroupDiscountPercent());
        r.setIsRecurring(t.getIsRecurring());
        r.setRecurrencePattern(t.getRecurrencePattern() != null ? t.getRecurrencePattern().name() : null);
        r.setRecurringDays(t.getRecurringDays());
        r.setRecurringUntil(t.getRecurringUntil());
        r.setRecurringDates(t.getRecurringDates());
        r.setExcludedDates(t.getExcludedDates());
        r.setStartDate(t.getStartDate());
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setIsActive(t.getIsActive());
        r.setRejectionReason(t.getRejectionReason());
        r.setShowInPortfolio(t.getShowInPortfolio());
        r.setAutoCancelIfMinNotMet(t.getAutoCancelIfMinNotMet());
        r.setDynamicPricing(t.getDynamicPricing());
        r.setHalalDetails(t.getHalalDetails());
        r.setMedia(toMediaResponseList(media));
        r.setCreatedAtUtc(t.getCreatedAtUtc());
        r.setUpdatedAtUtc(t.getUpdatedAtUtc());
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());
        if (Boolean.FALSE.equals(t.getIsRecurring()) && t.getRecurringDates() != null) {
            try {
                List<String> dates = objectMapper.readValue(t.getRecurringDates(), new TypeReference<List<String>>() {});
                if (!dates.isEmpty()) {
                    r.setStartDate(Instant.parse(dates.get(0)));
                }
            } catch (Exception e) {}
        }
        return r;
    }

    public TourTemplateResponse toTemplateResponse(TourTemplate t, List<TourMedia> media,
            List<TourOccurrence> completedOccurrences) {
        TourTemplateResponse r = toTemplateResponse(t, media);
        if (completedOccurrences != null) {
            int totalTravelers = 0;
            for (TourOccurrence o : completedOccurrences) {
                totalTravelers += (o.getSeatsReserved() != null ? o.getSeatsReserved() : 0);
            }
            r.setCompletedRunCount(completedOccurrences.size());
            r.setTotalTravelersCount(totalTravelers);
            r.setAverageRating(java.math.BigDecimal.ZERO);
            r.setReviewCount(0);
        }
        return r;
    }

    public PublicTourCardResponse toPublicCardResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            TourOccurrence nextOccurrence) {
        if (t == null) return null;
        PublicTourCardResponse r = new PublicTourCardResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCity(t.getCity());
        r.setCountryCode(t.getCountryCode());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setInstantBook(t.getInstantBook());
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideAvatarUrl(guide != null ? guide.getAvatarUrl() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);
        r.setCoverImageUrl(extractCoverImageUrl(media));
        r.setNextOccurrenceStartUtc(nextOccurrence != null ? nextOccurrence.getStartTimeUtc() : null);
        r.setAverageRating(t.getAverageRating());
        r.setReviewCount(t.getReviewCount());
        r.setIsPremium(t.getIsPremium());
        r.setIsFamilyFriendly(t.getIsFamilyFriendly());
        r.setHasGroupDiscount(t.getHasGroupDiscount());
        r.setGroupDiscountThreshold(t.getGroupDiscountThreshold());
        r.setGroupDiscountPercent(t.getGroupDiscountPercent());
        r.setDynamicPricing(t.getDynamicPricing());
        r.setHalalDetails(t.getHalalDetails());
        r.setDurationHours(t.getDurationHours());
        r.setDurationMinutes(t.getDurationMinutes());
        return r;
    }

    public PublicTourDetailResponse toPublicDetailResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            List<TourOccurrence> occurrences) {
        if (t == null) return null;
        PublicTourDetailResponse r = new PublicTourDetailResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCity(t.getCity());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setMeetingLatitude(t.getMeetingLatitude());
        r.setMeetingLongitude(t.getMeetingLongitude());
        r.setMeetingPointAddress(t.getMeetingPointAddress());
        r.setMeetingPointInstructions(t.getMeetingPointInstructions());
        r.setItinerary(t.getItinerary());
        r.setInclusions(t.getInclusions());
        r.setExclusions(t.getExclusions());
        r.setRequirements(t.getRequirements());
        r.setWhatToBring(t.getWhatToBring());
        r.setTags(t.getTags());
        r.setLanguages(t.getLanguages());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setDurationHours(t.getDurationHours());
        r.setDurationMinutes(t.getDurationMinutes());
        r.setInstantBook(t.getInstantBook());
        r.setIsRecurring(t.getIsRecurring());
        r.setRecurrencePattern(t.getRecurrencePattern() != null ? t.getRecurrencePattern().name() : null);
        r.setRecurringDays(t.getRecurringDays());
        r.setRecurringUntil(t.getRecurringUntil());
        r.setRecurringDates(t.getRecurringDates());
        r.setExcludedDates(t.getExcludedDates());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setIsFamilyFriendly(t.getIsFamilyFriendly());
        r.setHasGroupDiscount(t.getHasGroupDiscount());
        r.setGroupDiscountThreshold(t.getGroupDiscountThreshold());
        r.setGroupDiscountPercent(t.getGroupDiscountPercent());
        r.setDynamicPricing(t.getDynamicPricing());
        r.setHalalDetails(t.getHalalDetails());
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideAvatarUrl(guide != null ? guide.getAvatarUrl() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);
        r.setMedia(toMediaResponseList(media));
        r.setOccurrences(toOccurrenceResponseList(occurrences));
        r.setAverageRating(t.getAverageRating());
        r.setReviewCount(t.getReviewCount());
        return r;
    }

    public GuidePortfolioTourResponse toPortfolioCardResponse(
            TourTemplate t,
            List<TourMedia> media,
            int completedRunCount,
            int totalTravelers) {
        if (t == null) return null;
        GuidePortfolioTourResponse r = new GuidePortfolioTourResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCity(t.getCity());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setCoverImageUrl(extractCoverImageUrl(media));
        r.setCompletedRunCount(completedRunCount);
        r.setTotalTravelersCount(totalTravelers);
        r.setAverageRating(null);
        r.setReviewCount(null);
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setCurrentlyAvailable(t.getStatus() == TourTemplateStatus.PUBLISHED);
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());
        r.setIsPremium(t.getIsPremium());
        r.setIsFamilyFriendly(t.getIsFamilyFriendly());
        r.setHasGroupDiscount(t.getHasGroupDiscount());
        r.setGroupDiscountThreshold(t.getGroupDiscountThreshold());
        r.setGroupDiscountPercent(t.getGroupDiscountPercent());
        r.setDynamicPricing(t.getDynamicPricing());
        r.setHalalDetails(t.getHalalDetails());
        return r;
    }

    public GuidePortfolioTourDetailResponse toPortfolioDetailResponse(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            List<TourOccurrence> completedOccurrences,
            Long relatedPublishedId) {
        if (t == null) return null;
        GuidePortfolioTourDetailResponse r = new GuidePortfolioTourDetailResponse();
        r.setId(t.getId());
        r.setGuideId(guide != null ? guide.getId() : null);
        r.setGuideDisplayName(guideUser != null ? guideUser.getFullName() : null);
        r.setGuideAvatarUrl(guide != null ? guide.getAvatarUrl() : null);
        r.setGuideVerified(guide != null ? Boolean.TRUE.equals(guide.getIdVerified()) : false);
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setShortDescription(t.getShortDescription());
        r.setCategory(t.getCategory());
        r.setLocationName(t.getLocationName());
        r.setRegion(t.getRegion());
        r.setCity(t.getCity());
        r.setCountryCode(t.getCountryCode());
        r.setMeetingPointName(t.getMeetingPointName());
        r.setMeetingPointAddress(t.getMeetingPointAddress());
        r.setMeetingPointInstructions(t.getMeetingPointInstructions());
        r.setItinerary(t.getItinerary());
        r.setInclusions(t.getInclusions());
        r.setExclusions(t.getExclusions());
        r.setRequirements(t.getRequirements());
        r.setWhatToBring(t.getWhatToBring());
        r.setTags(t.getTags());
        r.setLanguages(t.getLanguages());
        r.setIsRecurring(t.getIsRecurring());
        r.setRecurrencePattern(t.getRecurrencePattern() != null ? t.getRecurrencePattern().name() : null);
        r.setRecurringDates(t.getRecurringDates());
        r.setExcludedDates(t.getExcludedDates());
        r.setBasePrice(t.getBasePrice());
        r.setCurrency(t.getCurrency());
        r.setMinCapacity(t.getMinCapacity());
        r.setMaxCapacity(t.getMaxCapacity());
        r.setDurationHours(t.getDurationHours());
        r.setDurationMinutes(t.getDurationMinutes());
        r.setHalalFriendly(t.getHalalFriendly());
        r.setInstantBook(t.getInstantBook());
        r.setMedia(toMediaResponseList(media));
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setCurrentlyAvailable(t.getStatus() == TourTemplateStatus.PUBLISHED);
        r.setRelatedPublishedTourId(relatedPublishedId);
        r.setLastPublishedAtUtc(t.getLastPublishedAtUtc());
        r.setIsPremium(t.getIsPremium());
        r.setIsFamilyFriendly(t.getIsFamilyFriendly());
        r.setHasGroupDiscount(t.getHasGroupDiscount());
        r.setGroupDiscountThreshold(t.getGroupDiscountThreshold());
        r.setGroupDiscountPercent(t.getGroupDiscountPercent());
        r.setDynamicPricing(t.getDynamicPricing());
        r.setHalalDetails(t.getHalalDetails());
        int totalTravelers = 0;
        List<GuidePortfolioTourDetailResponse.CompletedRunSummary> runs = new java.util.ArrayList<>();
        for (TourOccurrence o : completedOccurrences) {
            int attendees = o.getSeatsReserved() != null ? o.getSeatsReserved() : 0;
            totalTravelers += attendees;
            GuidePortfolioTourDetailResponse.CompletedRunSummary run = new GuidePortfolioTourDetailResponse.CompletedRunSummary();
            run.setOccurrenceId(o.getId());
            run.setStartTimeUtc(o.getStartTimeUtc());
            run.setEndTimeUtc(o.getEndTimeUtc());
            run.setAttendeeCount(attendees);
            runs.add(run);
        }
        r.setCompletedRunCount(completedOccurrences.size());
        r.setTotalTravelersCount(totalTravelers);
        r.setAverageRating(null);
        r.setReviewCount(null);
        r.setCompletedRuns(runs);
        return r;
    }
}

// BUFFER ZONE START
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// ................................................................................
// BUFFER ZONE END
