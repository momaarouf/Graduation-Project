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
import com.travelmarket.backend.entity.GuideLanguage;
import com.travelmarket.backend.repository.GuideLanguageRepository;
import com.travelmarket.backend.dto.PublicGuideProfileResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final GuideLanguageRepository guideLanguageRepository;
    private final TourMapper tourMapper;
    private final ObjectMapper objectMapper;

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
    @Transactional(readOnly = true)
    public List<PublicTourCardResponse> listTours(
            List<String> regions,
            String category,
            List<String> cities,
            String query,
            Boolean halalFriendly,
            Boolean instantBook,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minDuration,
            Integer maxDuration,
            Integer minCap,
            Integer maxCap,
            BigDecimal minRating,
            Boolean isPremium,
            Boolean isFamilyFriendly,
            Boolean hasGroupDiscount,
            String language,
            String sortBy
    ) {
        List<String> countryCodes = new java.util.ArrayList<>();
        List<String> actualRegions = new java.util.ArrayList<>();

        if (regions != null && !regions.isEmpty()) {
            for (String r : regions) {
                if (r == null || r.trim().isEmpty()) continue;
                String lr = r.toLowerCase().trim();
                if (lr.equals("lebanon")) {
                    countryCodes.add("LB");
                } else if (lr.equals("turkey")) {
                    countryCodes.add("TR");
                } else {
                    actualRegions.add(lr);
                }
            }
        }

        List<String> regionFilter = actualRegions.isEmpty() ? null : actualRegions;
        List<String> countryFilter = countryCodes.isEmpty() ? null : countryCodes;
        List<String> cityFilter   = (cities != null && !cities.isEmpty()) 
            ? cities.stream().filter(c -> c != null && !c.trim().isEmpty()).map(c -> c.toLowerCase().trim()).toList() 
            : null;
        String categoryFilter     = (category != null && !category.isEmpty()) ? category.toLowerCase() : null;
        String queryFilter        = (query != null && !query.isEmpty()) ? "%" + query.toLowerCase() + "%" : null;
        String languageFilter     = (language != null && !language.isEmpty()) ? "%" + language.toLowerCase() + "%" : null;

        String sort = sortBy != null ? sortBy : "newest";

        List<TourTemplate> templates = switch (sort) {
            case "price_asc" -> tourTemplateRepository.findWithFiltersPriceAsc(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter, 
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
            case "price_desc" -> tourTemplateRepository.findWithFiltersPriceDesc(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter, 
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
            default -> tourTemplateRepository.findWithFilters(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter, 
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
        };

        Instant now = Instant.now();
        List<PublicTourCardResponse> results = new ArrayList<>();

        for (TourTemplate t : templates) {
            GuideProfile guide = t.getGuide();
            User guideUser = userRepository.findById(guide.getUser().getId()).orElse(null);

            List<TourMedia> media = tourMediaRepository.findCoverByTemplateId(t.getId());

            List<TourOccurrence> upcoming = occurrenceRepository
                    .findNextScheduledByTemplateId(t.getId(), now);
            TourOccurrence next = upcoming.isEmpty() ? null : upcoming.get(0);

            results.add(tourMapper.toPublicCardResponse(t, guide, guideUser, media, next));
        }

        return results;
    }

    // ── Public: Tour detail ─────────────────────────────────────────────────────

    public PublicTourDetailResponse getTourDetail(Long id) {
        TourTemplate t = tourTemplateRepository.findByIdAndStatus(id, TourTemplateStatus.PUBLISHED)
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

    @Transactional(readOnly = true)
    public List<PublicTourCardResponse> getTourCards(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new java.util.ArrayList<>();
        
        List<TourTemplate> templates = tourTemplateRepository.findAllById(ids);
        Instant now = Instant.now();
        List<PublicTourCardResponse> results = new java.util.ArrayList<>();

        for (TourTemplate t : templates) {
            GuideProfile guide = t.getGuide();
            User guideUser = userRepository.findById(guide.getUser().getId()).orElse(null);
            List<TourMedia> media = tourMediaRepository.findCoverByTemplateId(t.getId());
            List<TourOccurrence> upcoming = occurrenceRepository.findNextScheduledByTemplateId(t.getId(), now);
            TourOccurrence next = upcoming.isEmpty() ? null : upcoming.get(0);

            results.add(tourMapper.toPublicCardResponse(t, guide, guideUser, media, next));
        }
        return results;
    }

    // ── Public: Occurrences for a tour ──────────────────────────────────────────

    public List<TourOccurrenceResponse> getPublicOccurrences(Long templateId) {
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

    public List<GuidePortfolioTourResponse> getGuidePortfolio(Long guideId) {
        GuideProfile guide = findGuideProfileChecked(guideId);

        List<TourTemplate> portfolioTours =
                tourTemplateRepository.findPortfolioByGuideId(guide.getId());

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

    public GuidePortfolioTourDetailResponse getPortfolioTourDetail(Long guideId, Long tourId) {
        GuideProfile guide = findGuideProfileChecked(guideId);

        User guideUser = userRepository.findById(guide.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Guide user data missing"));

        TourTemplate t = tourTemplateRepository.findPortfolioTourByIdAndGuideId(tourId, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found in portfolio"));

        List<TourMedia> media = tourMediaRepository.findAllByTemplateIdOrdered(t.getId());
        List<TourOccurrence> completed = occurrenceRepository.findCompletedByTemplateId(t.getId());

        Long relatedPublishedId = (t.getStatus() == TourTemplateStatus.PUBLISHED)
                ? t.getId() : null;

        return tourMapper.toPortfolioDetailResponse(
                t, guide, guideUser, media, completed, relatedPublishedId);
    }

    /**
     * Public profile lookup for the guide portfolio page.
     * Excludes sensitive fields (internal documents, payout accounts).
     */
    public PublicGuideProfileResponse getPublicGuideProfile(Long guideId) {
        GuideProfile gp = findGuideProfileChecked(guideId);
        return mapToPublicGuideProfile(gp);
    }

    public List<PublicGuideProfileResponse> searchGuides(String query) {
        if (query == null || query.isBlank()) return new ArrayList<>();

        String queryFilter = "%" + query.toLowerCase().trim() + "%";
        return guideProfileRepository.findByPartialName(queryFilter)
                .stream()
                .map(this::mapToPublicGuideProfile)
                .toList();
    }

    private PublicGuideProfileResponse mapToPublicGuideProfile(GuideProfile gp) {
        User user = gp.getUser();
        List<TourTemplate> portfolioTours = tourTemplateRepository.findPortfolioByGuideId(gp.getId());
        int tourCount = portfolioTours.size();

        List<PublicGuideProfileResponse.LanguageItem> languages = guideLanguageRepository.findByGuide_Id(gp.getId())
                .stream()
                .map(gl -> {
                    var item = new PublicGuideProfileResponse.LanguageItem();
                    item.setName(gl.getLanguage().getName());
                    item.setProficiency(gl.getProficiency());
                    return item;
                })
                .toList();

        List<String> expertise = new ArrayList<>();
        if (gp.getExpertiseJson() != null && !gp.getExpertiseJson().isBlank()) {
            try {
                expertise = objectMapper.readValue(gp.getExpertiseJson(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                // ignore
            }
        }

        PublicGuideProfileResponse res = new PublicGuideProfileResponse();
        res.setId(gp.getId());
        res.setName(user.getFullName());
        res.setTagline(gp.getTagline());
        res.setAvatarUrl(gp.getAvatarUrl());
        res.setCoverImageUrl(gp.getCoverImageUrl());
        res.setBio(gp.getBio());
        res.setCity(gp.getBaseCity());
        res.setCountry(gp.getBaseCountry());
        res.setExpertise(expertise);
        res.setLanguages(languages);
        res.setTotalGuidedTrips(gp.getTotalGuidedTrips() != null ? gp.getTotalGuidedTrips() : 0);
        res.setTourCount(tourCount);

        // Calculate aggregate rating from published tours
        double totalRatingPoints = 0;
        int totalReviews = 0;
        for (TourTemplate t : portfolioTours) {
            if (t.getReviewCount() != null && t.getReviewCount() > 0 && t.getAverageRating() != null) {
                totalRatingPoints += t.getAverageRating().doubleValue() * t.getReviewCount();
                totalReviews += t.getReviewCount();
            }
        }
        res.setAverageRating(totalReviews > 0 ? (totalRatingPoints / totalReviews) : null);
        
        res.setMemberSince(user.getCreatedAtUtc().toString());
        res.setVerified(Boolean.TRUE.equals(gp.getIdVerified()));

        return res;
    }

    private GuideProfile findGuideProfileChecked(Long id) {
        return guideProfileRepository.findById(id)
                .orElseGet(() -> guideProfileRepository.findByUserId(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide not found")));
    }
}