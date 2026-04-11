package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.GuideVerificationSubmitRequest;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/guide/verification")
@RequiredArgsConstructor
public class GuideVerificationController {

    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final NotificationService notificationService;

    /**
     * GET /api/guide/verification/status
     *
     * Returns the guide's current verification state.
     * Possible statuses:
     *   - not_submitted: no documents uploaded yet
     *   - pending: documents submitted, awaiting admin review
     *   - approved: admin approved
     *   - rejected: admin rejected (includes reason)
     */
    @GetMapping("/status")
    public Map<String, Object> status(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile missing"));

        Map<String, Object> result = new LinkedHashMap<>();

        if (Boolean.TRUE.equals(gp.getIdVerified())) {
            result.put("status", "approved");
            result.put("verifiedAt", gp.getIdVerifiedAtUtc());
        } else if (gp.getVerificationRejectedReason() != null
                   && !gp.getVerificationRejectedReason().isBlank()) {
            result.put("status", "rejected");
            result.put("rejectionReason", gp.getVerificationRejectedReason());
        } else if (gp.getVerificationSubmittedAtUtc() != null) {
            result.put("status", "pending");
        } else {
            result.put("status", "not_submitted");
        }

        result.put("documentType", gp.getIdDocumentType());
        result.put("submittedAt", gp.getVerificationSubmittedAtUtc());
        return result;
    }

    @PostMapping("/submit")
    public void submit(@AuthenticationPrincipal UserDetails principal,
                       @Valid @RequestBody GuideVerificationSubmitRequest req) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Guide) {
            throw new RuntimeException("Forbidden");
        }

        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile missing"));

        // ✅ Prevent resubmission once verified (professional)
        if (Boolean.TRUE.equals(gp.getIdVerified())) {
            throw new RuntimeException("Already verified. Contact support if you need to update your documents.");
        }

        String docType = req.getDocumentType().trim().toUpperCase();

        // Lebanon V1 rules:
        // - NATIONAL_ID: front + back + selfie
        // - PASSPORT: front + selfie (back allowed but optional)
        if ("NATIONAL_ID".equals(docType)) {
            if (isBlank(req.getIdBackImage())) {
                throw new RuntimeException("Back side is required for National ID");
            }
        } else if (!"PASSPORT".equals(docType)) {
            throw new RuntimeException("Invalid document type");
        }

        // Save new upgrade-friendly columns
        gp.setIdDocumentType(docType);
        gp.setIdFrontImage(req.getIdFrontImage().trim());
        gp.setIdBackImage(isBlank(req.getIdBackImage()) ? null : req.getIdBackImage().trim());
        gp.setSelfieImage(req.getSelfieImage().trim());

        // Mark submission time
        gp.setVerificationSubmittedAtUtc(Instant.now());

        // Resubmission should clear rejection
        gp.setVerificationRejectedReason(null);

        // Still false until admin approves
        gp.setIdVerified(false);
        gp.setIdVerifiedAtUtc(null);

        // Backward compatibility (if your entity still has it)
        gp.setIdVerificationImage(req.getIdFrontImage().trim());

        guideProfileRepository.save(gp);

        notificationService.createNotification(
                user.getId(),
                NotificationType.VERIFICATION_SUBMITTED,
                "Verification Submitted",
                "Your identity verification documents have been successfully submitted and are awaiting admin review.",
                null,
                null
        );
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}