package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.AdminAuditService;
import com.travelmarket.backend.tour.dto.request.CreateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.request.UpdateTourTemplateRequest;
import com.travelmarket.backend.tour.dto.response.TourTemplateResponse;
import com.travelmarket.backend.tour.entity.TourMedia;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourMediaRepository;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TourTemplateService {
    private final TourTemplateRepository tourTemplateRepository;
    private final TourOccurrenceRepository tourOccurrenceRepository;
    private final TourMediaRepository tourMediaRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;
    private final TourMapper tourMapper;
    private final ObjectMapper objectMapper;

    public TourTemplateService(
            TourTemplateRepository tourTemplateRepository,
            TourOccurrenceRepository tourOccurrenceRepository,
            TourMediaRepository tourMediaRepository,
            GuideProfileRepository guideProfileRepository,
            UserRepository userRepository,
            AdminAuditService adminAuditService,
            TourMapper tourMapper,
            ObjectMapper objectMapper) {
        this.tourTemplateRepository = tourTemplateRepository;
        this.tourOccurrenceRepository = tourOccurrenceRepository;
        this.tourMediaRepository = tourMediaRepository;
        this.guideProfileRepository = guideProfileRepository;
        this.userRepository = userRepository;
        this.adminAuditService = adminAuditService;
        this.tourMapper = tourMapper;
        this.objectMapper = objectMapper;
    }

    // ── Internal helpers ────────────────────────────────────────────────────────

    /**
     * Resolves the GuideProfile for the authenticated user.
     * Throws 404 if the guide profile doesn't exist (shouldn't happen in normal flow).
     */
    private GuideProfile resolveGuideProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide profile not found"));
    }

    /**
     * Resolves the User for the authenticated admin.
     */
    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    /**
     * Loads a tour and its media, then maps to TourTemplateResponse.
     * Used internally after any mutating operation to return the updated state.
     */
    private TourTemplateResponse buildResponse(TourTemplate t) {
        List<TourMedia> media = tourMediaRepository.findAllByTemplateIdOrdered(t.getId());
        List<TourOccurrence> completed = tourOccurrenceRepository.findCompletedByTemplateId(t.getId());
        return tourMapper.toTemplateResponse(t, media, completed);
    }

    // ── Guide: Create ───────────────────────────────────────────────────────────

    /**
     * Creates a new tour template owned by the authenticated guide.
     *
     * Business rules:
     *  - Status is always forced to DRAFT on creation regardless of request value.
     *    Guides cannot create tours in any other status.
     *  - Capacity validation: minCapacity must be <= maxCapacity.
     *  - Base price must be > 0 (enforced by @DecimalMin on DTO as well).
     */
    @Transactional
    public TourTemplateResponse createTour(String email, CreateTourTemplateRequest req) {
        GuideProfile guide = resolveGuideProfile(email);

        // Validate capacity relationship
        if (req.getMinCapacity() > req.getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "minCapacity must not exceed maxCapacity");
        }

        TourTemplate t = new TourTemplate();
        t.setGuide(guide);
        t.setTitle(req.getTitle().trim());
        t.setDescription(req.getDescription().trim());
        t.setShortDescription(req.getShortDescription() != null ? req.getShortDescription().trim() : null);
        t.setCategory(req.getCategory() != null ? req.getCategory().trim() : null);
        t.setLocationName(req.getLocationName() != null ? req.getLocationName().trim() : null);
        t.setRegion(req.getRegion() != null ? req.getRegion().trim() : null);
        t.setCity(req.getCity() != null ? req.getCity().trim() : null);
        t.setCountryCode(req.getCountryCode() != null ? req.getCountryCode().trim() : "LB");
        t.setMeetingPointName(req.getMeetingPointName() != null ? req.getMeetingPointName().trim() : null);
        t.setMeetingLatitude(req.getMeetingLatitude());
        t.setMeetingLongitude(req.getMeetingLongitude());
        t.setMeetingPointAddress(req.getMeetingPointAddress());
        t.setMeetingPointInstructions(req.getMeetingPointInstructions());
        t.setItinerary(req.getItinerary());
        t.setInclusions(req.getInclusions());
        t.setExclusions(req.getExclusions());
        t.setRequirements(req.getRequirements());
        t.setWhatToBring(req.getWhatToBring());
        t.setTags(req.getTags());
        t.setLanguages(req.getLanguages());
        t.setRecurringDays(req.getRecurringDays());
        t.setRecurringUntil(req.getRecurringUntil());
        t.setRecurringDates(req.getRecurringDates());
        t.setStartDate(req.getStartDate());
        t.setExcludedDates(req.getExcludedDates());
        t.setBasePrice(req.getBasePrice());
        t.setCurrency(req.getCurrency() != null ? req.getCurrency().trim() : "USD");
        t.setMinCapacity(req.getMinCapacity());
        t.setMaxCapacity(req.getMaxCapacity());
        t.setDurationHours(req.getDurationHours() != null ? req.getDurationHours() : 2);
        t.setDurationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 0);
        t.setInstantBook(Boolean.TRUE.equals(req.getInstantBook()));
        t.setIsRecurring(Boolean.TRUE.equals(req.getIsRecurring()));
        t.setRecurrencePattern(req.getRecurrencePattern() != null
                ? req.getRecurrencePattern()
                : com.travelmarket.backend.tour.enums.RecurrencePattern.NONE);
        t.setHalalFriendly(Boolean.TRUE.equals(req.getHalalFriendly()));
        t.setAutoCancelIfMinNotMet(req.getAutoCancelIfMinNotMet() != null
                ? req.getAutoCancelIfMinNotMet() : true);
        t.setShowInPortfolio(req.getShowInPortfolio() != null
                ? req.getShowInPortfolio() : true);

        // New fields
        t.setIsPremium(Boolean.TRUE.equals(req.getIsPremium()));
        t.setIsFamilyFriendly(req.getIsFamilyFriendly() != null ? req.getIsFamilyFriendly() : true);
        t.setHasGroupDiscount(Boolean.TRUE.equals(req.getHasGroupDiscount()));
        t.setGroupDiscountThreshold(req.getGroupDiscountThreshold());
        t.setGroupDiscountPercent(req.getGroupDiscountPercent());
        t.setDynamicPricing(req.getDynamicPricing());
        t.setHalalDetails(req.getHalalDetails());

        // Always DRAFT on create — guide cannot publish directly
        t.setStatus(TourTemplateStatus.DRAFT);
        t.setIsActive(true);

        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    // ── Guide: Read ─────────────────────────────────────────────────────────────

    /** All non-deleted tours owned by the authenticated guide. */
    public List<TourTemplateResponse> getGuideTours(String email) {
        GuideProfile guide = resolveGuideProfile(email);
        return tourTemplateRepository.findAllByGuideId(guide.getId())
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    /** One non-deleted tour owned by the authenticated guide. */
    public TourTemplateResponse getGuideTour(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
        return buildResponse(t);
    }

    // ── Guide: Update ───────────────────────────────────────────────────────────

    /**
     * Updates an existing tour template with patch semantics (null fields skipped).
     *
     * Status transition rules on edit:
     *  - DRAFT      → stays DRAFT
     *  - REJECTED   → stays REJECTED (guide must explicitly resubmit)
     *  - PUBLISHED  → moves to PENDING_REVIEW (re-review required)
     *  - PAUSED     → moves to PENDING_REVIEW (re-review required)
     *  - PENDING_REVIEW → LOCKED, cannot edit (guide must withdraw first)
     *  - ARCHIVED   → LOCKED, terminal state
     */
    @Transactional
    public TourTemplateResponse updateTour(String email, Long id, UpdateTourTemplateRequest req) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        // Enforce edit locks
        if (t.getStatus() == TourTemplateStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tour is under review. Withdraw it first before editing.");
        }
        if (t.getStatus() == TourTemplateStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Archived tours cannot be edited.");
        }

        // Apply non-null fields (patch semantics)
        if (req.getTitle() != null)             t.setTitle(req.getTitle().trim());
        if (req.getDescription() != null)       t.setDescription(req.getDescription().trim());
        if (req.getShortDescription() != null)  t.setShortDescription(req.getShortDescription().trim());
        if (req.getCategory() != null)          t.setCategory(req.getCategory().trim());
        if (req.getLocationName() != null)      t.setLocationName(req.getLocationName().trim());
        if (req.getRegion() != null)            t.setRegion(req.getRegion().trim());
        if (req.getCity() != null)              t.setCity(req.getCity().trim());
        if (req.getCountryCode() != null)       t.setCountryCode(req.getCountryCode().trim());
        if (req.getMeetingPointName() != null)  t.setMeetingPointName(req.getMeetingPointName().trim());
        if (req.getMeetingLatitude() != null)   t.setMeetingLatitude(req.getMeetingLatitude());
        if (req.getMeetingLongitude() != null)  t.setMeetingLongitude(req.getMeetingLongitude());
        if (req.getMeetingPointAddress() != null) t.setMeetingPointAddress(req.getMeetingPointAddress());
        if (req.getMeetingPointInstructions() != null) t.setMeetingPointInstructions(req.getMeetingPointInstructions());
        if (req.getItinerary() != null)         t.setItinerary(req.getItinerary());
        if (req.getInclusions() != null)        t.setInclusions(req.getInclusions());
        if (req.getExclusions() != null)        t.setExclusions(req.getExclusions());
        if (req.getRequirements() != null)      t.setRequirements(req.getRequirements());
        if (req.getWhatToBring() != null)       t.setWhatToBring(req.getWhatToBring());
        if (req.getTags() != null)              t.setTags(req.getTags());
        if (req.getLanguages() != null)         t.setLanguages(req.getLanguages());
        if (req.getBasePrice() != null)         t.setBasePrice(req.getBasePrice());
        if (req.getCurrency() != null)          t.setCurrency(req.getCurrency().trim());
        if (req.getInstantBook() != null)       t.setInstantBook(req.getInstantBook());
        if (req.getIsRecurring() != null)       t.setIsRecurring(req.getIsRecurring());
        if (req.getRecurrencePattern() != null) t.setRecurrencePattern(req.getRecurrencePattern());
        if (req.getRecurringDays() != null)     t.setRecurringDays(req.getRecurringDays());
        if (req.getRecurringUntil() != null)    t.setRecurringUntil(req.getRecurringUntil());
        if (req.getRecurringDates() != null)    t.setRecurringDates(req.getRecurringDates());
        if (req.getStartDate() != null)         t.setStartDate(req.getStartDate());
        if (req.getExcludedDates() != null)     t.setExcludedDates(req.getExcludedDates());
        if (req.getHalalFriendly() != null)     t.setHalalFriendly(req.getHalalFriendly());
        if (req.getAutoCancelIfMinNotMet() != null) t.setAutoCancelIfMinNotMet(req.getAutoCancelIfMinNotMet());
        if (req.getShowInPortfolio() != null)   t.setShowInPortfolio(req.getShowInPortfolio());
        if (req.getDurationHours() != null)     t.setDurationHours(req.getDurationHours());
        if (req.getDurationMinutes() != null)   t.setDurationMinutes(req.getDurationMinutes());

        if (req.getIsPremium() != null)         t.setIsPremium(req.getIsPremium());
        if (req.getIsFamilyFriendly() != null)  t.setIsFamilyFriendly(req.getIsFamilyFriendly());
        if (req.getHasGroupDiscount() != null)  t.setHasGroupDiscount(req.getHasGroupDiscount());
        if (req.getGroupDiscountThreshold() != null) t.setGroupDiscountThreshold(req.getGroupDiscountThreshold());
        if (req.getGroupDiscountPercent() != null) t.setGroupDiscountPercent(req.getGroupDiscountPercent());
        if (req.getDynamicPricing() != null)    t.setDynamicPricing(req.getDynamicPricing());
        if (req.getHalalDetails() != null)      t.setHalalDetails(req.getHalalDetails());

        // Validate capacity after applying new values
        if (req.getMinCapacity() != null) t.setMinCapacity(req.getMinCapacity());
        if (req.getMaxCapacity() != null) t.setMaxCapacity(req.getMaxCapacity());
        if (t.getMinCapacity() > t.getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "minCapacity must not exceed maxCapacity");
        }

        // Status transition: PUBLISHED/PAUSED edits require re-approval.
        // Skip if ONLY non-vettable fields (showInPortfolio, autoCancelIfMinNotMet) are provided.
        if (t.getStatus() == TourTemplateStatus.PUBLISHED || t.getStatus() == TourTemplateStatus.PAUSED) {
            if (isVettableChange(req)) {
                t.setStatus(TourTemplateStatus.PENDING_REVIEW);
            }
        }
        // DRAFT and REJECTED stay as-is until the guide explicitly submits

        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    // ── Guide: Soft delete ──────────────────────────────────────────────────────

    /**
     * Soft-deletes a tour template.
     *
     * Business rules:
     *  - Cannot delete a PUBLISHED tour that has active future occurrences.
     *    This protects travelers who may be viewing or in the process of booking.
     *  - All other statuses can be deleted freely.
     */
    @Transactional
    public void deleteTour(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        // Block delete if published with active upcoming occurrences
        if (t.getStatus() == TourTemplateStatus.PUBLISHED) {
            boolean hasActive = tourOccurrenceRepository
                    .hasActiveFutureOccurrences(t.getId(), Instant.now());
            if (hasActive) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Cannot delete a published tour with active future occurrences. " +
                                "Cancel or complete all occurrences first.");
            }
        }

        t.setDeletedAtUtc(Instant.now());
        tourTemplateRepository.save(t);
    }

    // ── Guide: Status transitions ───────────────────────────────────────────────

    /**
     * Submits a tour for admin review.
     * Allowed from: DRAFT, REJECTED.
     * Clears any previous rejection reason (guide has addressed the feedback).
     */
    @Transactional
    public TourTemplateResponse submitForReview(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.DRAFT
                && t.getStatus() != TourTemplateStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only DRAFT or REJECTED tours can be submitted for review. " +
                            "Current status: " + t.getStatus());
        }

        // Clear the rejection reason — guide is resubmitting with changes
        t.setRejectionReason(null);
        t.setStatus(TourTemplateStatus.PENDING_REVIEW);
        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    /**
     * Withdraws a tour from the review queue back to DRAFT.
     * Useful if the guide wants to make more changes before resubmitting.
     */
    @Transactional
    public TourTemplateResponse withdrawFromReview(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PENDING_REVIEW tours can be withdrawn. " +
                            "Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.DRAFT);
        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    /**
     * Guide pauses a published tour (temporarily hides from public).
     * The tour remains in the portfolio. Occurrences are not affected.
     */
    @Transactional
    public TourTemplateResponse pauseTour(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PUBLISHED tours can be paused. Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.PAUSED);
        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    /**
     * Guide resumes a paused tour.
     * Transition: PAUSED -> PENDING_REVIEW (requires re-approval).
     */
    @Transactional
    public TourTemplateResponse resumeTour(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PAUSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PAUSED tours can be resumed. Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.PENDING_REVIEW);
        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    /**
     * Guide archives a tour permanently (terminal state).
     * Allowed from PUBLISHED or PAUSED.
     * The tour stays in portfolio if show_in_portfolio = true.
     */
    @Transactional
    public TourTemplateResponse archiveTour(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PUBLISHED
                && t.getStatus() != TourTemplateStatus.PAUSED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PUBLISHED or PAUSED tours can be archived. " +
                            "Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.ARCHIVED);
        tourTemplateRepository.save(t);
        return buildResponse(t);
    }

    /**
     * DEV-ONLY: Immediately publish a tour bypassing admin review.
     * Sets status to PUBLISHED and sets lastPublishedAtUtc to now.
     */
    @Transactional
    public TourTemplateResponse publishTourImmediately(String email, Long id) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(id, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        // Only allow from DRAFT, PENDING_REVIEW, or REJECTED for this shortcut
        if (t.getStatus() == TourTemplateStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Archived tours cannot be published.");
        }

        t.setStatus(TourTemplateStatus.PUBLISHED);
        t.setLastPublishedAtUtc(Instant.now());
        t.setRejectionReason(null);
        tourTemplateRepository.save(t);

        // Required for search visibility and booking availability
        generateInitialOccurrences(t);

        return buildResponse(t);
    }

    // ── Admin: Review queue ─────────────────────────────────────────────────────

    /** All tours currently waiting for admin approval, oldest first. */
    public List<TourTemplateResponse> getPendingTours() {
        return tourTemplateRepository.findByStatusOrderByUpdatedAtAsc(TourTemplateStatus.PENDING_REVIEW)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    /**
     * Admin approves a tour — moves it to PUBLISHED.
     * Sets last_published_at_utc to now (enables occurrences and portfolio).
     * Audit-logged.
     */
    @Transactional
    public TourTemplateResponse approveTour(String adminEmail, Long id) {
        User admin = resolveUser(adminEmail);
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PENDING_REVIEW tours can be approved. " +
                            "Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.PUBLISHED);
        t.setLastPublishedAtUtc(Instant.now());
        t.setRejectionReason(null); // clear any old reason
        tourTemplateRepository.save(t);

        adminAuditService.log(admin, "TOUR_APPROVED", "TourTemplate", id,
                "Tour approved and published: " + t.getTitle(), null);

        generateInitialOccurrences(t);

        return buildResponse(t);
    }

    /**
     * Admin rejects a tour — moves it to REJECTED with a mandatory reason.
     * The guide sees the rejection reason and can edit + resubmit.
     * Audit-logged.
     */
    @Transactional
    public TourTemplateResponse rejectTour(String adminEmail, Long id, String rejectionReason) {
        User admin = resolveUser(adminEmail);
        TourTemplate t = tourTemplateRepository.findByIdNotDeleted(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (t.getStatus() != TourTemplateStatus.PENDING_REVIEW) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only PENDING_REVIEW tours can be rejected. " +
                            "Current status: " + t.getStatus());
        }

        t.setStatus(TourTemplateStatus.REJECTED);
        t.setRejectionReason(rejectionReason.trim());
        tourTemplateRepository.save(t);

        adminAuditService.log(admin, "TOUR_REJECTED", "TourTemplate", id,
                "Tour rejected: " + t.getTitle(),
                java.util.Map.of("reason", rejectionReason));

        return buildResponse(t);
    }

    /**
     * Generates the initial set of occurrences for a newly published tour.
     * Currently handles CUSTOM/NONE (one-time) and DAILY patterns.
     * Weekly/Monthly logic can be expanded here.
     */
    private void generateInitialOccurrences(TourTemplate t) {
        List<Instant> startTimes = new ArrayList<>();

        // 1. One-time tour (NONE pattern) with a specific startDate
        if (t.getRecurrencePattern() == com.travelmarket.backend.tour.enums.RecurrencePattern.NONE && t.getStartDate() != null) {
            startTimes.add(t.getStartDate());
        } 
        // 2. Custom dates (JSON array)
        else if (t.getRecurrencePattern() == com.travelmarket.backend.tour.enums.RecurrencePattern.CUSTOM && t.getRecurringDates() != null) {
            try {
                List<String> dates = objectMapper.readValue(t.getRecurringDates(), new TypeReference<List<String>>() {});
                for (String d : dates) {
                    try {
                        startTimes.add(parseResilient(d));
                    } catch (Exception e) {
                        // Skip individual invalid date
                    }
                }
            } catch (Exception e) {
                // Invalid JSON or format; skip
            }
        } 
        // 3. DAILY pattern
        else if (t.getRecurrencePattern() == com.travelmarket.backend.tour.enums.RecurrencePattern.DAILY) {
            Instant start = (t.getStartDate() != null && t.getStartDate().isAfter(Instant.now()))
                    ? t.getStartDate() 
                    : Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
            
            Instant end = t.getRecurringUntil() != null ? t.getRecurringUntil() : start.plus(30, ChronoUnit.DAYS);

            while (start.isBefore(end)) {
                startTimes.add(start);
                start = start.plus(1, ChronoUnit.DAYS);
            }
        } 
        // 4. WEEKLY pattern (respects selected days)
        else if (t.getRecurrencePattern() == com.travelmarket.backend.tour.enums.RecurrencePattern.WEEKLY) {
            Instant start = (t.getStartDate() != null && t.getStartDate().isAfter(Instant.now()))
                    ? t.getStartDate() 
                    : Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
            Instant end = t.getRecurringUntil() != null ? t.getRecurringUntil() : start.plus(90, ChronoUnit.DAYS);

            // Parse recurring days (e.g. "MONDAY,FRIDAY")
            java.util.Set<java.time.DayOfWeek> allowedDays = new java.util.HashSet<>();
            if (t.getRecurringDays() != null) {
                for (String day : t.getRecurringDays().split(",")) {
                    try {
                        allowedDays.add(java.time.DayOfWeek.valueOf(day.trim().toUpperCase()));
                    } catch (Exception e) { /* ignore garbage */ }
                }
            }

            while (start.isBefore(end)) {
                java.time.ZonedDateTime zdt = start.atZone(java.time.ZoneOffset.UTC);
                if (allowedDays.isEmpty() || allowedDays.contains(zdt.getDayOfWeek())) {
                    startTimes.add(start);
                }
                start = start.plus(1, ChronoUnit.DAYS);
            }
        } 
        // 5. MONTHLY pattern
        else if (t.getRecurrencePattern() == com.travelmarket.backend.tour.enums.RecurrencePattern.MONTHLY) {
            Instant start = (t.getStartDate() != null && t.getStartDate().isAfter(Instant.now()))
                    ? t.getStartDate() 
                    : Instant.now().truncatedTo(ChronoUnit.DAYS).plus(1, ChronoUnit.DAYS);
            Instant end = t.getRecurringUntil() != null ? t.getRecurringUntil() : start.plus(180, ChronoUnit.DAYS);

            while (start.isBefore(end)) {
                startTimes.add(start);
                start = start.atZone(java.time.ZoneOffset.UTC).plusMonths(1).toInstant();
            }
        }

        for (Instant start : startTimes) {
            // Check for duplicates
            if (tourOccurrenceRepository.existsByTemplateIdAndStartTimeUtc(t.getId(), start)) {
                continue;
            }

            TourOccurrence occ = new TourOccurrence();
            occ.setTemplate(t);
            occ.setStartTimeUtc(start);
            occ.setEndTimeUtc(start.plus(t.getDurationHours(), ChronoUnit.HOURS)
                                   .plus(t.getDurationMinutes(), ChronoUnit.MINUTES));
            occ.setStatus(TourOccurrenceStatus.SCHEDULED);
            tourOccurrenceRepository.save(occ);
        }
    }

    /**
     * Determines if the update request contains fields that require admin re-review.
     * Non-vettable fields like showInPortfolio and autoCancelIfMinNotMet are ignored.
     */
    private boolean isVettableChange(UpdateTourTemplateRequest req) {
        return req.getTitle() != null ||
               req.getDescription() != null ||
               req.getShortDescription() != null ||
               req.getCategory() != null ||
               req.getLocationName() != null ||
               req.getRegion() != null ||
               req.getCity() != null ||
               req.getCountryCode() != null ||
               req.getMeetingPointName() != null ||
               req.getMeetingLatitude() != null ||
               req.getMeetingLongitude() != null ||
               req.getMeetingPointAddress() != null ||
               req.getMeetingPointInstructions() != null ||
               req.getItinerary() != null ||
               req.getInclusions() != null ||
               req.getExclusions() != null ||
               req.getRequirements() != null ||
               req.getWhatToBring() != null ||
               req.getTags() != null ||
               req.getLanguages() != null ||
               req.getStartDate() != null ||
               req.getBasePrice() != null ||
               req.getCurrency() != null ||
               req.getMinCapacity() != null ||
               req.getMaxCapacity() != null ||
               req.getDurationHours() != null ||
               req.getDurationMinutes() != null ||
               req.getIsRecurring() != null ||
               req.getRecurrencePattern() != null ||
               req.getRecurringDays() != null ||
               req.getRecurringUntil() != null ||
               req.getRecurringDates() != null ||
               req.getExcludedDates() != null ||
               req.getHalalFriendly() != null;
    }

    /**
     * Tries to parse an ISO date string as an Instant.
     * If it lacks a timezone (e.g. from datetime-local), appends 'Z' to treat as UTC.
     */
    private Instant parseResilient(String d) {
        if (d == null || d.isBlank()) return null;
        String clean = d.trim();
        // If it looks like 2026-03-20T10:00 but lacks 'Z' or offset
        if (clean.contains("T") && !clean.endsWith("Z") && !clean.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            // Append Z to treat as UTC per product rules
            clean += "Z";
        }
        return Instant.parse(clean);
    }
}
