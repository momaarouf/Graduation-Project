package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.dto.response.*;
import com.travelmarket.backend.tour.entity.TourMapPoint;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourMapPointRepository;
import com.travelmarket.backend.tour.repository.TourMediaRepository;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.booking.repository.WaitlistRepository;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicTourService {

    private final TourTemplateRepository    tourTemplateRepository;
    private final TourOccurrenceRepository  occurrenceRepository;
    private final TourMediaRepository       tourMediaRepository;
    private final GuideProfileRepository    guideProfileRepository;
    private final UserRepository            userRepository;
    private final GuideLanguageRepository   guideLanguageRepository;
    private final BookingRepository         bookingRepository;
    private final WaitlistRepository        waitlistRepository;
    private final TourMapper                tourMapper;
    private final ObjectMapper              objectMapper;
    // Needed for route and nearby queries — added for geo/map feature
    private final TourMapPointRepository    mapPointRepository;

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
            String sortBy,
            Integer limit,
            Integer offset
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

        List<String> regionFilter   = actualRegions.isEmpty() ? null : actualRegions;
        List<String> countryFilter  = countryCodes.isEmpty() ? null : countryCodes;
        List<String> cityFilter     = (cities != null && !cities.isEmpty())
                ? cities.stream().filter(c -> c != null && !c.trim().isEmpty()).map(c -> c.toLowerCase().trim()).toList()
                : null;
        String categoryFilter       = (category != null && !category.isEmpty()) ? category.toLowerCase() : null;
        String queryFilter          = (query != null && !query.isEmpty()) ? "%" + query.toLowerCase() + "%" : null;
        String languageFilter       = (language != null && !language.isEmpty()) ? "%" + language.toLowerCase() + "%" : null;

        String sort = sortBy != null ? sortBy : "newest";

        // Pagination: default limit 20, max 100; default offset 0
        int pageLimit = limit != null ? Math.min(Math.max(limit, 1), 100) : 20;
        int pageOffset = offset != null ? Math.max(offset, 0) : 0;

        List<TourTemplate> templates = switch (sort) {
            case "price_asc"  -> tourTemplateRepository.findWithFiltersPriceAsc(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter,
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
            case "price_desc" -> tourTemplateRepository.findWithFiltersPriceDesc(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter,
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
            default           -> tourTemplateRepository.findWithFilters(
                    TourTemplateStatus.PUBLISHED, regionFilter, countryFilter, categoryFilter, cityFilter, queryFilter,
                    halalFriendly, instantBook, minPrice, maxPrice, minDuration, maxDuration, minCap, maxCap,
                    minRating, isPremium, isFamilyFriendly, hasGroupDiscount, languageFilter);
        };

        List<Long> templateIds = templates.stream().map(TourTemplate::getId).collect(Collectors.toList());

        if (templateIds.isEmpty()) return new ArrayList<>();

        // Batch-load occurrences and media — 2 queries instead of 2N
        Instant now = Instant.now();
        Map<Long, TourOccurrence> nextOccurrenceByTemplateId = buildNextOccurrenceMap(templateIds, now);
        Map<Long, TourMedia> coverByTemplateId = buildCoverMediaMap(templateIds);

        List<PublicTourCardResponse> results = new ArrayList<>();
        for (TourTemplate t : templates) {
            TourOccurrence next = nextOccurrenceByTemplateId.get(t.getId());
            // Skip tours with no future bookable occurrences
            if (next == null) continue;

            GuideProfile guide = t.getGuide();
            User guideUser    = guide.getUser();
            TourMedia cover   = coverByTemplateId.get(t.getId());
            List<TourMedia> media = cover != null ? List.of(cover) : List.of();

            results.add(tourMapper.toPublicCardResponse(t, guide, guideUser, media, next));
        }

        // Apply pagination to final results
        int start = pageOffset;
        int end = Math.min(start + pageLimit, results.size());
        if (start >= results.size()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(results.subList(start, end));
    }

    // ── Public: Bounding box search ─────────────────────────────────────────────

    /**
     * Returns published tours whose meeting point falls within the supplied
     * lat/lng bounding box. Called when the user pans or zooms the map.
     *
     * Powered by GET /api/public/tours?minLat=&maxLat=&minLng=&maxLng=
     * (extra params on the existing /tours endpoint — no breaking change)
     *
     * The V44 partial index on (meeting_latitude, meeting_longitude) makes
     * this a fast range scan rather than a full table scan.
     *
     * All results include meetingLatitude/meetingLongitude so the frontend
     * can place pins without a second request.
     *
     * @param minLat  south edge (min latitude)
     * @param maxLat  north edge (max latitude)
     * @param minLng  west  edge (min longitude)
     * @param maxLng  east  edge (max longitude)
     */
    @Transactional(readOnly = true)
    public List<PublicTourCardResponse> getToursInBoundingBox(
            BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng) {

        List<TourTemplate> candidates = tourTemplateRepository
                .findWithinBoundingBox(minLat, maxLat, minLng, maxLng);

        List<Long> templateIds = candidates.stream().map(TourTemplate::getId).collect(Collectors.toList());
        if (templateIds.isEmpty()) return new ArrayList<>();

        Instant now = Instant.now();
        Map<Long, TourOccurrence> nextOccurrenceByTemplateId = buildNextOccurrenceMap(templateIds, now);
        Map<Long, TourMedia> coverByTemplateId = buildCoverMediaMap(templateIds);

        List<PublicTourCardResponse> results = new ArrayList<>();
        for (TourTemplate t : candidates) {
            TourOccurrence next = nextOccurrenceByTemplateId.get(t.getId());
            if (next == null) continue;

            GuideProfile guide = t.getGuide();
            User guideUser    = guide.getUser();
            TourMedia cover   = coverByTemplateId.get(t.getId());
            List<TourMedia> media = cover != null ? List.of(cover) : List.of();

            results.add(buildCardWithCoords(t, guide, guideUser, media, next));
        }

        return results;
    }

    // ── Public: Nearby tour search (radius / haversine) ─────────────────────────

    /**
     * Returns published tours within radiusKm of the supplied centre point,
     * sorted by distance ascending (closest first).
     *
     * Powered by GET /api/public/tours/nearby?lat=&lng=&radiusKm=
     *
     * Algorithm: haversine formula in JPQL (TourTemplateRepository.findWithinRadius).
     * LEAST(1.0, ...) guard prevents acos(NaN) on floating-point boundary values.
     * Earth radius constant: 6371 km. Accurate to ~0.5% for distances under 1000 km.
     *
     * distanceKm is recomputed in Java (same haversine) and rounded to 1 decimal
     * for the response. JPQL cannot return both entity + scalar in one projection
     * without a custom @SqlResultSetMapping, so two passes is cleaner here.
     *
     * Only tours with meeting coordinates are considered (nulls excluded by query).
     * Tours with no future occurrences are silently skipped.
     *
     * @param lat       centre latitude  (traveler position or map centre)
     * @param lng       centre longitude
     * @param radiusKm  search radius in km — validated 0.1–500 in controller
     */
    @Transactional(readOnly = true)
    public List<NearbyTourResponse> getNearbyTours(double lat, double lng, double radiusKm) {

        List<TourTemplate> candidates = tourTemplateRepository.findWithinRadius(lat, lng, radiusKm);

        List<Long> templateIds = candidates.stream().map(TourTemplate::getId).collect(Collectors.toList());
        if (templateIds.isEmpty()) return new ArrayList<>();

        Instant now = Instant.now();
        Map<Long, TourOccurrence> nextOccurrenceByTemplateId = buildNextOccurrenceMap(templateIds, now);
        Map<Long, TourMedia> coverByTemplateId = buildCoverMediaMap(templateIds);

        List<NearbyTourResponse> results = new ArrayList<>();
        for (TourTemplate t : candidates) {
            TourOccurrence next = nextOccurrenceByTemplateId.get(t.getId());
            if (next == null) continue;

            GuideProfile guide = t.getGuide();
            User guideUser    = guide.getUser();
            TourMedia cover   = coverByTemplateId.get(t.getId());
            List<TourMedia> media = cover != null ? List.of(cover) : List.of();

            PublicTourCardResponse card = buildCardWithCoords(t, guide, guideUser, media, next);

            double distKm = haversineKm(
                    lat, lng,
                    t.getMeetingLatitude().doubleValue(),
                    t.getMeetingLongitude().doubleValue()
            );

            NearbyTourResponse nearby = new NearbyTourResponse();
            copyCardFields(card, nearby);
            nearby.setDistanceKm(Math.round(distKm * 10.0) / 10.0);

            results.add(nearby);
        }

        return results;
    }

    // ── Public: Tour route (trail) ───────────────────────────────────────────────

    /**
     * Returns the ordered waypoints (trail) for a tour's next upcoming occurrence.
     *
     * Powered by GET /api/public/tours/{id}/route
     *
     * The frontend connects these waypoints as a Leaflet.js polyline to draw
     * the route on the map (e.g. Jbeil → Byblos ruins → Beirut Souks).
     *
     * Returns an empty waypoints list (not 404) when:
     *   - The tour has no upcoming occurrences
     *   - The guide has not set a route for the upcoming occurrence
     * The map simply hides the trail section in those cases.
     *
     * @param tourTemplateId  public tour ID from /api/public/tours/{id}
     */
    @Transactional(readOnly = true)
    public TourRouteResponse getTourRoute(Long tourTemplateId) {

        // Verify the tour is publicly accessible
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(tourTemplateId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Tour not found"));

        // Must be published or previously published (under re-review)
        if (t.getLastPublishedAtUtc() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        // Route belongs to the next upcoming occurrence
        List<TourOccurrence> upcoming = occurrenceRepository
                .findPublicFutureByTemplateId(tourTemplateId, Instant.now());

        // No upcoming occurrences — empty route, not an error
        if (upcoming.isEmpty()) {
            return new TourRouteResponse(tourTemplateId, null, null, List.of());
        }

        TourOccurrence nextOccurrence = upcoming.get(0);

        // Fetch waypoints ordered by orderIndex ASC (the trail from start to end)
        List<TourMapPoint> points = mapPointRepository
                .findAllByOccurrenceIdOrdered(nextOccurrence.getId());

        // Map entity → DTO
        List<TourMapPointResponse> waypoints = points.stream()
                .map(p -> new TourMapPointResponse(
                        p.getId(),
                        p.getLatitude(),
                        p.getLongitude(),
                        p.getOrderIndex(),
                        p.getPointName()  // nullable — null if guide skipped label
                ))
                .toList();

        return new TourRouteResponse(
                tourTemplateId,
                nextOccurrence.getId(),
                nextOccurrence.getStartTimeUtc(),
                waypoints
        );
    }

    // ── Public: Tour detail ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PublicTourDetailResponse getTourDetail(Long id, String email) {
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PUBLISHED &&
                !(t.getStatus() == TourTemplateStatus.PENDING_REVIEW && t.getLastPublishedAtUtc() != null)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        GuideProfile guide = t.getGuide();
        User guideUser = guide.getUser(); // already loaded via JOIN FETCH on the template query

        List<TourMedia> media = tourMediaRepository.findAllByTemplateIdOrdered(t.getId());
        List<TourOccurrence> occurrences = occurrenceRepository
                .findPublicFutureByTemplateId(t.getId(), Instant.now());

        PublicTourDetailResponse response = tourMapper.toPublicDetailResponse(t, guide, guideUser, media, occurrences);

        if (email != null) {
            var activeBookings = bookingRepository.findActiveByTravelerAndTemplate(
                    email, id, List.of(com.travelmarket.backend.booking.enums.BookingStatus.Cancelled,
                            com.travelmarket.backend.booking.enums.BookingStatus.Expired));

            if (!activeBookings.isEmpty()) {
                List<PublicActiveBookingResponse> bookingSummaries = activeBookings.stream()
                        .map(b -> PublicActiveBookingResponse.builder()
                                .id(b.getId())
                                .status(b.getStatus().name())
                                .occurrenceId(b.getOccurrence().getId())
                                .peopleCount(b.getPeopleCount())
                                .finalPrice(b.getFinalPrice())
                                .currency(b.getCurrency())
                                .startTime(b.getOccurrence().getStartTimeUtc())
                                .build())
                        .collect(java.util.stream.Collectors.toList());
                response.setActiveBookings(bookingSummaries);
            }

            var waitlistEntries = waitlistRepository.findActiveByTravelerAndTemplate(email, id);
            if (!waitlistEntries.isEmpty()) {
                List<PublicActiveWaitlistResponse> waitlistSummaries = waitlistEntries.stream()
                        .map(w -> PublicActiveWaitlistResponse.builder()
                                .id(w.getId())
                                .occurrenceId(w.getOccurrence().getId())
                                .peopleCount(w.getPeopleCount())
                                .position(w.getPosition())
                                .createdAt(w.getCreatedAtUtc())
                                .build())
                        .collect(java.util.stream.Collectors.toList());
                response.setActiveWaitlistEntries(waitlistSummaries);
            }
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<PublicTourCardResponse> getTourCards(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new java.util.ArrayList<>();

        List<TourTemplate> templates = tourTemplateRepository.findAllById(ids);
        if (templates.isEmpty()) return new java.util.ArrayList<>();

        List<Long> templateIds = templates.stream().map(TourTemplate::getId).collect(Collectors.toList());
        Instant now = Instant.now();

        // Batch-load media and occurrences
        Map<Long, TourMedia> coverByTemplateId = buildCoverMediaMap(templateIds);
        Map<Long, TourOccurrence> nextOccurrenceByTemplateId = buildNextOccurrenceMap(templateIds, now);

        List<PublicTourCardResponse> results = new java.util.ArrayList<>();
        for (TourTemplate t : templates) {
            GuideProfile guide  = t.getGuide();
            User guideUser      = guide.getUser();
            TourMedia cover     = coverByTemplateId.get(t.getId());
            List<TourMedia> media = cover != null ? List.of(cover) : List.of();
            TourOccurrence next = nextOccurrenceByTemplateId.get(t.getId());
            results.add(tourMapper.toPublicCardResponse(t, guide, guideUser, media, next));
        }
        return results;
    }

    @Transactional(readOnly = true)
    public List<TourOccurrenceResponse> getPublicOccurrences(Long templateId) {
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(templateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getLastPublishedAtUtc() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found");
        }

        List<TourOccurrence> occurrences = occurrenceRepository
                .findPublicFutureByTemplateId(templateId, Instant.now());

        return occurrences.stream()
                .map(tourMapper::toOccurrenceResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GuidePortfolioTourResponse> getGuidePortfolio(Long guideId) {
        GuideProfile guide = findGuideProfileChecked(guideId);
        List<TourTemplate> portfolioTours = tourTemplateRepository.findPortfolioByGuideId(guide.getId());
        if (portfolioTours.isEmpty()) return new ArrayList<>();

        List<Long> templateIds = portfolioTours.stream().map(TourTemplate::getId).collect(Collectors.toList());

        // Batch-load media and occurrences
        Map<Long, TourMedia> coverByTemplateId = buildCoverMediaMap(templateIds);

        // For portfolio, we need completed counts. We can't use buildNextOccurrenceMap easily here.
        // But we can batch fetch completed occurrences.
        List<TourOccurrence> allCompleted = occurrenceRepository.findAllByTemplateIdInAndStatus(
                templateIds, com.travelmarket.backend.tour.enums.TourOccurrenceStatus.COMPLETED);

        Map<Long, List<TourOccurrence>> completedMap = allCompleted.stream()
                .collect(Collectors.groupingBy(o -> o.getTemplate().getId()));

        List<GuidePortfolioTourResponse> results = new ArrayList<>();
        for (TourTemplate t : portfolioTours) {
            TourMedia cover = coverByTemplateId.get(t.getId());
            List<TourMedia> media = cover != null ? List.of(cover) : List.of();
            List<TourOccurrence> completed = completedMap.getOrDefault(t.getId(), List.of());

            int runCount = completed.size();
            int totalTravelers = completed.stream()
                    .mapToInt(o -> o.getSeatsReserved() != null ? o.getSeatsReserved() : 0)
                    .sum();
            results.add(tourMapper.toPortfolioCardResponse(t, media, runCount, totalTravelers));
        }
        return results;
    }

    @Transactional(readOnly = true)
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
        Long relatedPublishedId = (t.getStatus() == TourTemplateStatus.PUBLISHED) ? t.getId() : null;

        return tourMapper.toPortfolioDetailResponse(t, guide, guideUser, media, completed, relatedPublishedId);
    }

    @Transactional(readOnly = true)
    public PublicGuideProfileResponse getPublicGuideProfile(Long guideId) {
        GuideProfile gp = findGuideProfileChecked(guideId);
        return mapToPublicGuideProfile(gp);
    }

    @Transactional(readOnly = true)
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
                // ignore malformed JSON
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

        double totalRatingPoints = 0;
        int totalReviews = 0;
        for (TourTemplate t : portfolioTours) {
            if (t.getReviewCount() != null && t.getReviewCount() > 0 && t.getAverageRating() != null) {
                totalRatingPoints += t.getAverageRating().doubleValue() * t.getReviewCount();
                totalReviews      += t.getReviewCount();
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

    // ── Private batch helpers (N+1 elimination) ──────────────────────────────────

    /**
     * Returns the first upcoming occurrence per templateId, keyed by templateId.
     * Uses a single batch query — O(1) DB round-trips regardless of result count.
     */
    private Map<Long, TourOccurrence> buildNextOccurrenceMap(List<Long> templateIds, Instant now) {
        List<TourOccurrence> all = occurrenceRepository.findPublicFutureByTemplateIds(templateIds, now);
        // Query returns results ORDER BY templateId ASC, startTimeUtc ASC
        // — so the first occurrence we see per templateId is the earliest one
        Map<Long, TourOccurrence> map = new LinkedHashMap<>();
        for (TourOccurrence o : all) {
            map.putIfAbsent(o.getTemplate().getId(), o);
        }
        return map;
    }

    /**
     * Returns the cover (lowest displayOrder) media per templateId, keyed by templateId.
     * Uses a single batch query — O(1) DB round-trips regardless of result count.
     */
    private Map<Long, TourMedia> buildCoverMediaMap(List<Long> templateIds) {
        List<TourMedia> all = tourMediaRepository.findCoversByTemplateIds(templateIds);
        // Query returns results ORDER BY templateId ASC, displayOrder ASC
        // — so the first media we see per templateId is the cover
        Map<Long, TourMedia> map = new LinkedHashMap<>();
        for (TourMedia m : all) {
            map.putIfAbsent(m.getTemplate().getId(), m);
        }
        return map;
    }

    // ── Private geo helpers ──────────────────────────────────────────────────────


    /**
     * Builds a PublicTourCardResponse and populates the meeting coordinates.
     * Coordinates are included on the card for map pin placement (bbox/nearby endpoints).
     * The base TourMapper.toPublicCardResponse() also sets them now that they
     * are fields on PublicTourCardResponse — this method calls the mapper and
     * ensures both coordinate fields are set.
     */
    private PublicTourCardResponse buildCardWithCoords(
            TourTemplate t,
            GuideProfile guide,
            User guideUser,
            List<TourMedia> media,
            TourOccurrence next) {

        // Use the existing mapper for all standard fields
        PublicTourCardResponse card = tourMapper.toPublicCardResponse(t, guide, guideUser, media, next);

        // Ensure coordinates are populated — mapper may not set these yet
        // until TourMapper is updated to include the new fields. Safe to set here always.
        if (card.getMeetingLatitude() == null)  card.setMeetingLatitude(t.getMeetingLatitude());
        if (card.getMeetingLongitude() == null) card.setMeetingLongitude(t.getMeetingLongitude());

        return card;
    }

    /**
     * Haversine formula — great-circle distance between two WGS-84 points in km.
     *
     * Accurate to ~0.5% for distances under 1000 km.
     * Lebanon is ~200 km north-to-south, well within accuracy range.
     *
     * Reference: https://en.wikipedia.org/wiki/Haversine_formula
     */
    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Copies all fields from a PublicTourCardResponse into a NearbyTourResponse.
     * NearbyTourResponse extends PublicTourCardResponse but has no copy constructor.
     */
    private void copyCardFields(PublicTourCardResponse src, NearbyTourResponse dst) {
        dst.setId(src.getId());
        dst.setTitle(src.getTitle());
        dst.setShortDescription(src.getShortDescription());
        dst.setCategory(src.getCategory());
        dst.setLocationName(src.getLocationName());
        dst.setRegion(src.getRegion());
        dst.setCity(src.getCity());
        dst.setCountryCode(src.getCountryCode());
        dst.setMeetingLatitude(src.getMeetingLatitude());
        dst.setMeetingLongitude(src.getMeetingLongitude());
        dst.setBasePrice(src.getBasePrice());
        dst.setCurrency(src.getCurrency());
        dst.setHalalFriendly(src.getHalalFriendly());
        dst.setInstantBook(src.getInstantBook());
        dst.setGuideId(src.getGuideId());
        dst.setGuideDisplayName(src.getGuideDisplayName());
        dst.setGuideAvatarUrl(src.getGuideAvatarUrl());
        dst.setGuideVerified(src.getGuideVerified());
        dst.setCoverImageUrl(src.getCoverImageUrl());
        dst.setNextOccurrenceStartUtc(src.getNextOccurrenceStartUtc());
        dst.setAverageRating(src.getAverageRating());
        dst.setReviewCount(src.getReviewCount());
        dst.setDurationHours(src.getDurationHours());
        dst.setDurationMinutes(src.getDurationMinutes());
        dst.setIsPremium(src.getIsPremium());
        dst.setIsFamilyFriendly(src.getIsFamilyFriendly());
        dst.setHasGroupDiscount(src.getHasGroupDiscount());
    }
}