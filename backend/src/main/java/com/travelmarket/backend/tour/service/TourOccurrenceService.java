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

        if (onlyPublished && t.getStatus() != TourTemplateStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Occurrences can only be created for PUBLISHED tours. " +
                            "Current status: " + t.getStatus());
        }

        return t;
    }

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

    private Instant parseResilient(String d) {
        if (d == null || d.isBlank()) return null;
        String clean = d.trim();
        if (clean.contains("T") && !clean.endsWith("Z") && !clean.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            clean += "Z";
        }
        return Instant.parse(clean);
    }
}
