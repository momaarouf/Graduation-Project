package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.dto.request.CreateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.request.SetTourRouteRequest;
import com.travelmarket.backend.tour.dto.request.UpdateOccurrenceRequest;
import com.travelmarket.backend.tour.dto.response.TourMapPointResponse;
import com.travelmarket.backend.tour.dto.response.TourOccurrenceResponse;
import com.travelmarket.backend.tour.dto.response.TourRouteResponse;
import com.travelmarket.backend.tour.entity.TourMapPoint;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.mapper.TourMapper;
import com.travelmarket.backend.tour.repository.TourMapPointRepository;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TourOccurrenceService {

    private final TourOccurrenceRepository occurrenceRepository;
    private final TourTemplateRepository   tourTemplateRepository;
    private final GuideProfileRepository   guideProfileRepository;
    private final UserRepository           userRepository;
    private final TourMapper               tourMapper;
    // Added for route (trail) management
    private final TourMapPointRepository   mapPointRepository;

    // ── Internal helpers ──────────────────────────────────────────────────────

    private GuideProfile resolveGuideProfile(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide profile not found"));
    }

    private TourTemplate resolveOwnedTemplate(Long templateId, Long guideId, boolean onlyPublished) {
        TourTemplate t = tourTemplateRepository.findByIdAndGuideId(templateId, guideId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour not found or does not belong to you"));

        if (onlyPublished && (t.getStatus() == TourTemplateStatus.PENDING_REVIEW
                || t.getStatus() == TourTemplateStatus.ARCHIVED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Occurrences cannot be created while the tour is " + t.getStatus() + ". " +
                            "Please withdraw from review or activate the tour first.");
        }

        return t;
    }

    // ── Existing occurrence CRUD ──────────────────────────────────────────────

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

    @Transactional
    public TourOccurrenceResponse createOccurrence(
            String email, Long templateId, CreateOccurrenceRequest req) {
        GuideProfile guide = resolveGuideProfile(email);
        TourTemplate template = resolveOwnedTemplate(templateId, guide.getId(), true);
        Instant now = Instant.now();
        if (!req.getStartTimeUtc().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Occurrence start time must be in the future");
        }
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
        o.setCapacity(template.getMaxCapacity());
        o.setAvailableSeats(template.getMaxCapacity());
        occurrenceRepository.save(o);
        return tourMapper.toOccurrenceResponse(o);
    }

    public List<TourOccurrenceResponse> getGuideOccurrences(String email, Long templateId) {
        GuideProfile guide = resolveGuideProfile(email);
        resolveOwnedTemplate(templateId, guide.getId(), false);
        return occurrenceRepository.findAllByTemplateId(templateId)
                .stream()
                .map(tourMapper::toOccurrenceResponse)
                .toList();
    }

    @Transactional
    public TourOccurrenceResponse updateOccurrence(
            String email, Long occurrenceId, UpdateOccurrenceRequest req) {
        GuideProfile guide = resolveGuideProfile(email);
        TourOccurrence o = occurrenceRepository.findByIdAndGuideId(occurrenceId, guide.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Occurrence not found or does not belong to you"));
        if (o.getStatus() == TourOccurrenceStatus.CANCELLED
                || o.getStatus() == TourOccurrenceStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot update a " + o.getStatus() + " occurrence");
        }
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
        if (req.getStatus() != null) {
            if (req.getStatus() == TourOccurrenceStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Status FULL is set automatically by the booking system, not manually");
            }
            if (req.getStatus() == TourOccurrenceStatus.SCHEDULED
                    && o.getStatus() != TourOccurrenceStatus.SCHEDULED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot set a non-SCHEDULED occurrence back to SCHEDULED");
            }
            o.setStatus(req.getStatus());
        }
        occurrenceRepository.save(o);
        return tourMapper.toOccurrenceResponse(o);
    }

    // ── Route (trail) management ──────────────────────────────────────────────

    /**
     * Sets or replaces the ordered waypoints (trail) for a specific occurrence.
     *
     * Powered by PUT /api/guide/occurrences/{occurrenceId}/route
     *
     * Strategy: delete-all + re-insert in one transaction.
     * Simpler and safer than diffing individual points — ordering changes
     * cannot be expressed as diffs cleanly.
     *
     * Validation chain:
     *   1. Occurrence exists                             → 404
     *   2. Occurrence belongs to this guide             → 403 (ownership)
     *   3. At least 2 waypoints                         → 400 (Bean Validation on request)
     *   4. orderIndex values unique within the list     → 400 (checked here)
     *   5. Coordinates within valid lat/lng range       → 400 (Bean Validation on request)
     *
     * Returns the saved route immediately so the frontend can render the trail
     * without issuing a second GET request.
     *
     * @param occurrenceId  the occurrence to attach the route to
     * @param guideEmail    authenticated guide email from JWT principal
     * @param request       ordered list of waypoints (min 2)
     */
    @Transactional
    public TourRouteResponse setTourRoute(Long occurrenceId,
                                          String guideEmail,
                                          SetTourRouteRequest request) {

        // ── 1. Occurrence exists ──────────────────────────────────────────────
        TourOccurrence occurrence = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Occurrence not found: " + occurrenceId
                ));

        // ── 2. OWNERSHIP CHECK ────────────────────────────────────────────────
        // Route via: occurrence → template → guide → user → email
        // Consistent with how TourTemplateService.resolveGuideProfile() works.
        String ownerEmail = occurrence.getTemplate()
                .getGuide()
                .getUser()
                .getEmail();

        if (!ownerEmail.equals(guideEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only set routes for your own occurrences"
            );
        }

        // ── 3. orderIndex uniqueness ──────────────────────────────────────────
        // Bean Validation enforces min=2 waypoints and valid coordinates.
        // Here we catch duplicate orderIndex values that Bean Validation
        // cannot express on a collection element level.
        Set<Integer> seen = new HashSet<>();
        for (SetTourRouteRequest.WaypointRequest wp : request.waypoints()) {
            if (!seen.add(wp.orderIndex())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate orderIndex " + wp.orderIndex()
                                + " — each waypoint must have a unique position"
                );
            }
        }

        // ── 4. Delete existing waypoints ──────────────────────────────────────
        // Atomic replace: clear old route then insert new one in one transaction.
        mapPointRepository.deleteAllByOccurrenceId(occurrenceId);

        // ── 5. Build and save new waypoints ───────────────────────────────────
        List<TourMapPoint> newPoints = new ArrayList<>();
        for (SetTourRouteRequest.WaypointRequest wp : request.waypoints()) {
            TourMapPoint point = TourMapPoint.builder()
                    .occurrence(occurrence)
                    .latitude(wp.latitude())
                    .longitude(wp.longitude())
                    .orderIndex(wp.orderIndex())
                    .pointName(wp.pointName())   // nullable — guide may omit labels
                    .build();
            newPoints.add(point);
        }

        List<TourMapPoint> saved = mapPointRepository.saveAll(newPoints);

        // ── 6. Return the saved route ─────────────────────────────────────────
        // Sort by orderIndex so the response matches the same contract as getTourRoute()
        List<TourMapPointResponse> waypoints = saved.stream()
                .sorted(Comparator.comparingInt(TourMapPoint::getOrderIndex))
                .map(p -> new TourMapPointResponse(
                        p.getId(),
                        p.getLatitude(),
                        p.getLongitude(),
                        p.getOrderIndex(),
                        p.getPointName()
                ))
                .toList();

        return new TourRouteResponse(
                occurrence.getTemplate().getId(),
                occurrenceId,
                occurrence.getStartTimeUtc(),
                waypoints
        );
    }

    private Instant parseResilient(String d) {
        if (d == null || d.isBlank()) return null;
        String clean = d.trim();
        if (clean.contains("T") && !clean.endsWith("Z") && !clean.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            clean += "Z";
        }
        return Instant.parse(clean);
    }
}