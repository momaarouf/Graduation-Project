package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.GuideVerificationSubmitRequest;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/guide/verification")
@RequiredArgsConstructor
public class GuideVerificationController {

    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;

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
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}