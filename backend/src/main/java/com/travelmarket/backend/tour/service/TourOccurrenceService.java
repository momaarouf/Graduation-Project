package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.dto.request.CreateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.UpdateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.response.TourOccurrenceResponse;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourOccurrenceService {

    private final TourOccurrenceRepository occurrenceRepository;
    private final TourTemplateRepository tourTemplateRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;
    private final TourMapper tourMapper;

    // ── Internal helpers ────────────────────────────────────────────────────────

    private GuideProfile resolveGuideProfile(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide profile not found"));
    }

    /**
     * Verifies the template exists, belongs to the guide, is not deleted,
     * and is in an appropriate status for occurrence management.
     *
     * @param onlyPublished if true, rejects non-PUBLISHED templates
     *                      (used on create; update/delete are more permissive)
     */
    private TourTemplate resolveOwnedTemplate(Long templateId, Long guideId, boolean onlyPublished) {
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(templateId, guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found or does not belong to you"));

        if (onlyPublished && t.getStatus() != TourTemplateStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Occurrences can only be created for PUBLISHED tours. " +
                            "Current status: " + t.getStatus());
        }

        return t;
    }

    // ── Guide: Create occurrence ────────────────────────────────────────────────

    /**
     * Creates a new occurrence under a guide-owned, published tour.
     *
     * Business rules:
     *  - Template must be PUBLISHED (admin-approved).
     *  - Start time must be in the future.
     *  - End time must be after start time.
     *  - Ownership verified through template.guide.id.
     */
    @Transactional
    public TourOccurrenceResponse createOccurrence(
            String email, Long templateId, CreateOccurrenceRequest req) {

        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate template = resolveOwnedTemplate(templateId, guide.getId(), true);

        Instant now = Instant.now();

        // Start must be in the future
        if (!req.getStartTimeUtc().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Occurrence start time must be in the future");
        }

        // End must be after start
        if (!req.getEndTimeUtc().isAfter(req.getStartTimeUtc())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Occurrence end time must be after start time");
        }

        TourOccurrence o = new TourOccurrence();
        o.setTemplate(template);
        o.setStartTimeUtc(req.getStartTimeUtc());
        o.setEndTimeUtc(req.getEndTimeUtc());
        o.setStatus(TourOccurrenceStatus.SCHEDULED);
        o.setSeatsReserved(0);

        occurrenceRepository.save(o);
        return tourMapper.toOccurrenceResponse(o);
    }

    // ── Guide: List occurrences ─────────────────────────────────────────────────

    /**
     * All non-deleted occurrences for a guide-owned tour.
     * Returns all statuses so the guide sees their full schedule history.
     */
    public List<TourOccurrenceResponse> getGuideOccurrences(String email, Long templateId) {
        GuideProfile guide = resolveGuideProfile(email);
        // Ownership check: template must belong to this guide
        resolveOwnedTemplate(templateId, guide.getId(), false);

        return occurrenceRepository.findAllByTemplateId(templateId)
                .stream()
                .map(tourMapper::toOccurrenceResponse)
                .toList();
    }

    // ── Guide: Update occurrence ────────────────────────────────────────────────

    /**
     * Updates an occurrence. Ownership is verified through the template chain.
     *
     * Allowed status transitions by the guide:
     *  - SCHEDULED → CANCELLED  (guide cancels)
     *  - SCHEDULED → COMPLETED  (guide marks done)
     *
     * Disallowed transitions (enforced here):
     *  - Setting FULL (booking logic sets this automatically)
     *  - Changing a CANCELLED or COMPLETED occurrence
     *
     * Time updates:
     *  - Cannot reschedule a CANCELLED or COMPLETED occurrence.
     *  - New start must be in the future.
     *  - New end must be after new start.
     */
    @Transactional
    public TourOccurrenceResponse updateOccurrence(
            String email, Long occurrenceId, UpdateOccurrenceRequest req) {

        GuideProfile guide = resolveGuideProfile(email);

        // Ownership verified through template → guide chain
        TourOccurrence o = occurrenceRepository.findByIdAndGuideId(occurrenceId, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Occurrence not found or does not belong to you"));

        // Prevent editing terminal occurrences
        if (o.getStatus() == TourOccurrenceStatus.CANCELLED
                || o.getStatus() == TourOccurrenceStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot update a " + o.getStatus() + " occurrence");
        }

        // Apply time changes if provided
        Instant newStart = req.getStartTimeUtc() != null ? req.getStartTimeUtc() : o.getStartTimeUtc();
        Instant newEnd   = req.getEndTimeUtc()   != null ? req.getEndTimeUtc()   : o.getEndTimeUtc();

        if (req.getStartTimeUtc() != null && !newStart.isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Start time must be in the future");
        }
        if (!newEnd.isAfter(newStart)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        o.setStartTimeUtc(newStart);
        o.setEndTimeUtc(newEnd);

        // Apply status change if provided
        if (req.getStatus() != null) {
            // Guide may only set CANCELLED or COMPLETED
            if (req.getStatus() == TourOccurrenceStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Status FULL is set automatically by the booking system, not manually");
            }
            if (req.getStatus() == TourOccurrenceStatus.SCHEDULED
                    && o.getStatus() != TourOccurrenceStatus.SCHEDULED) {
                // Prevent re-opening a non-scheduled occurrence
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot set a non-SCHEDULED occurrence back to SCHEDULED");
            }
            o.setStatus(req.getStatus());
        }

        occurrenceRepository.save(o);
        return tourMapper.toOccurrenceResponse(o);
    }

    // ── Guide: Soft delete occurrence ───────────────────────────────────────────

    /**
     * Soft-deletes an occurrence.
     * Cannot delete a COMPLETED occurrence (it is part of the track record).
     */
    @Transactional
    public void deleteOccurrence(String email, Long occurrenceId) {
        GuideProfile guide = resolveGuideProfile(email);

        TourOccurrence o = occurrenceRepository.findByIdAndGuideId(occurrenceId, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Occurrence not found or does not belong to you"));

        if (o.getStatus() == TourOccurrenceStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Completed occurrences cannot be deleted — they form part of your track record");
        }

        o.setDeletedAtUtc(Instant.now());
        occurrenceRepository.save(o);
    }
}