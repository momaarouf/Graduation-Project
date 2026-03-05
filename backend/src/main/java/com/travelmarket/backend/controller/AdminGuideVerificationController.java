package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.VerifiedGuideAdminResponse;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.repository.GuideProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/guide-verifications")
@RequiredArgsConstructor
public class AdminGuideVerificationController {

    private final GuideProfileRepository guideProfileRepository;

    /** Pending queue: submitted, not verified, not rejected */
    @GetMapping("/pending")
    public List<GuideProfile> pending() {
        return guideProfileRepository.findPendingVerifications();
    }

    /** Rejected queue: submitted, not verified, rejected */
    @GetMapping("/rejected")
    public List<GuideProfile> rejected() {
        return guideProfileRepository.findRejectedVerifications();
    }

    /**
     * Approve guide ID.
     * Professional rule: You can only approve a "pending" submission:
     * - submittedAt exists
     * - NOT rejected
     */
    @PatchMapping("/{guideProfileId}/approve")
    public void approve(@PathVariable Long guideProfileId) {
        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        // ✅ This is the key rule you requested
        if (gp.getVerificationRejectedReason() != null) {
            throw new RuntimeException("Cannot approve a rejected submission. Guide must resubmit first.");
        }

        // Optional strict checks (recommended):
        // - Must have front + selfie
        if (isBlank(gp.getIdFrontImage()) && isBlank(gp.getIdVerificationImage())) {
            throw new RuntimeException("Missing ID front image.");
        }
        if (isBlank(gp.getSelfieImage())) {
            throw new RuntimeException("Missing selfie image.");
        }

        // If National ID, require back
        if ("NATIONAL_ID".equalsIgnoreCase(nullToEmpty(gp.getIdDocumentType()))) {
            if (isBlank(gp.getIdBackImage())) {
                throw new RuntimeException("National ID requires back image.");
            }
        }

        gp.setIdVerified(true);
        gp.setIdVerifiedAtUtc(Instant.now());
        gp.setVerificationRejectedReason(null);

        guideProfileRepository.save(gp);
    }

    /**
     * Reject guide ID.
     * Adds a rejection reason and keeps it unverified.
     */
    @PatchMapping("/{guideProfileId}/reject")
    public void reject(@PathVariable Long guideProfileId, @RequestParam String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        gp.setIdVerified(false);
        gp.setIdVerifiedAtUtc(null);
        gp.setVerificationRejectedReason(reason.trim());

        guideProfileRepository.save(gp);
    }

    /**
     * Optional: Approve even if rejected (explicit override).
     * Use only for rare edge cases. Keeps behavior professional + auditable.
     */
    @PatchMapping("/{guideProfileId}/approve-override")
    public void approveOverride(@PathVariable Long guideProfileId,
                                @RequestParam(required = false) String note) {

        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        gp.setIdVerified(true);
        gp.setIdVerifiedAtUtc(Instant.now());

        // Keep rejection reason cleared, but if you want to store the override note,
        // you can reuse verificationRejectedReason or create a separate audit field.
        gp.setVerificationRejectedReason(null);

        guideProfileRepository.save(gp);
    }
    @GetMapping("/verified")
    public List<VerifiedGuideAdminResponse> verified() {
        return guideProfileRepository.findVerifiedGuides().stream()
                .map(gp -> new VerifiedGuideAdminResponse(
                        gp.getId(),
                        gp.getUser().getId(),
                        gp.getUser().getEmail(),
                        gp.getUser().getFullName(),
                        gp.getBaseCountry(),
                        gp.getBaseCity(),
                        gp.getIdVerifiedAtUtc(),
                        gp.getVerificationSubmittedAtUtc()
                ))
                .toList();
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s.trim();
    }
}