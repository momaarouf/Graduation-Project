package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.VerifiedGuideAdminResponse;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.AdminAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/guide-verifications")
@RequiredArgsConstructor
public class AdminGuideVerificationController {

    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    private User currentAdmin(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
    }

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

    @PatchMapping("/{guideProfileId}/approve")
    public void approve(@PathVariable Long guideProfileId, Authentication auth) {
        User admin = currentAdmin(auth);

        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        if (gp.getVerificationRejectedReason() != null) {
            throw new RuntimeException("Cannot approve a rejected submission. Guide must resubmit first.");
        }

        if (isBlank(gp.getIdFrontImage()) && isBlank(gp.getIdVerificationImage())) {
            throw new RuntimeException("Missing ID front image.");
        }
        if (isBlank(gp.getSelfieImage())) {
            throw new RuntimeException("Missing selfie image.");
        }

        if ("NATIONAL_ID".equalsIgnoreCase(nullToEmpty(gp.getIdDocumentType()))) {
            if (isBlank(gp.getIdBackImage())) {
                throw new RuntimeException("National ID requires back image.");
            }
        }

        boolean oldVerified = Boolean.TRUE.equals(gp.getIdVerified());
        String oldRejectedReason = gp.getVerificationRejectedReason();

        gp.setIdVerified(true);
        gp.setIdVerifiedAtUtc(Instant.now());
        gp.setVerificationRejectedReason(null);
        guideProfileRepository.save(gp);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("guideProfileId", gp.getId());
        details.put("guideUserId", gp.getUser() != null ? gp.getUser().getId() : null);
        details.put("oldIdVerified", oldVerified);
        details.put("newIdVerified", gp.getIdVerified());
        details.put("oldRejectedReason", oldRejectedReason);
        details.put("documentType", gp.getIdDocumentType());
        details.put("submittedAtUtc", gp.getVerificationSubmittedAtUtc());

        adminAuditService.log(
                admin,
                "GUIDE_VERIFY_APPROVE",
                "GUIDE_PROFILE",
                gp.getId(),
                "Approved guide verification",
                details
        );
    }

    @PatchMapping("/{guideProfileId}/reject")
    public void reject(@PathVariable Long guideProfileId,
                       @RequestParam String reason,
                       Authentication auth) {
        User admin = currentAdmin(auth);

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        boolean oldVerified = Boolean.TRUE.equals(gp.getIdVerified());
        String oldRejectedReason = gp.getVerificationRejectedReason();

        gp.setIdVerified(false);
        gp.setIdVerifiedAtUtc(null);
        gp.setVerificationRejectedReason(reason.trim());
        guideProfileRepository.save(gp);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("guideProfileId", gp.getId());
        details.put("guideUserId", gp.getUser() != null ? gp.getUser().getId() : null);
        details.put("oldIdVerified", oldVerified);
        details.put("newIdVerified", gp.getIdVerified());
        details.put("oldRejectedReason", oldRejectedReason);
        details.put("newRejectedReason", gp.getVerificationRejectedReason());
        details.put("submittedAtUtc", gp.getVerificationSubmittedAtUtc());

        adminAuditService.log(
                admin,
                "GUIDE_VERIFY_REJECT",
                "GUIDE_PROFILE",
                gp.getId(),
                "Rejected guide verification",
                details
        );
    }

    @PatchMapping("/{guideProfileId}/approve-override")
    public void approveOverride(@PathVariable Long guideProfileId,
                                @RequestParam(required = false) String note,
                                Authentication auth) {
        User admin = currentAdmin(auth);

        GuideProfile gp = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        if (gp.getVerificationSubmittedAtUtc() == null) {
            throw new RuntimeException("No verification submission found for this guide.");
        }

        boolean oldVerified = Boolean.TRUE.equals(gp.getIdVerified());
        String oldRejectedReason = gp.getVerificationRejectedReason();

        gp.setIdVerified(true);
        gp.setIdVerifiedAtUtc(Instant.now());
        gp.setVerificationRejectedReason(null);
        guideProfileRepository.save(gp);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("guideProfileId", gp.getId());
        details.put("guideUserId", gp.getUser() != null ? gp.getUser().getId() : null);
        details.put("oldIdVerified", oldVerified);
        details.put("newIdVerified", gp.getIdVerified());
        details.put("oldRejectedReason", oldRejectedReason);
        details.put("note", note);
        details.put("submittedAtUtc", gp.getVerificationSubmittedAtUtc());

        adminAuditService.log(
                admin,
                "GUIDE_VERIFY_APPROVE_OVERRIDE",
                "GUIDE_PROFILE",
                gp.getId(),
                "Approved guide verification (override)",
                details
        );
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