package com.travelmarket.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.travelmarket.backend.dto.GuideCompleteProfileRequest;
import com.travelmarket.backend.dto.GuideProfileResponse;
import com.travelmarket.backend.entity.*;
import com.travelmarket.backend.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/guide/profile")
@RequiredArgsConstructor
public class GuideProfileController {

    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final LanguageRepository languageRepository;
    private final GuideLanguageRepository guideLanguageRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public GuideProfileResponse getProfile(@AuthenticationPrincipal UserDetails principal) throws Exception {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Guide) {
            throw new AccessDeniedException("Forbidden");
        }

        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile missing"));

        GuideProfileResponse res = new GuideProfileResponse();
        res.setFullName(user.getFullName());
        res.setPhoneE164(user.getPhoneE164());
        res.setCountry(gp.getBaseCountry());
        res.setCity(gp.getBaseCity());
        res.setBio(gp.getBio());

        if (gp.getExpertiseJson() != null && !gp.getExpertiseJson().isBlank()) {
            res.setExpertise(objectMapper.readValue(gp.getExpertiseJson(), new TypeReference<List<String>>() {}));
        } else {
            res.setExpertise(List.of());
        }

        List<GuideLanguage> glList = guideLanguageRepository.findByGuide_Id(gp.getId());
        List<GuideProfileResponse.LanguageItem> languages = glList.stream().map(gl -> {
            GuideProfileResponse.LanguageItem item = new GuideProfileResponse.LanguageItem();
            item.setName(gl.getLanguage().getName());
            item.setProficiency(gl.getProficiency());
            return item;
        }).collect(Collectors.toList());

        res.setLanguages(languages);

        res.setEmail(user.getEmail());
        res.setMemberSince(user.getCreatedAtUtc() != null ? user.getCreatedAtUtc().toString() : "");
        res.setVerifiedSince(gp.getIdVerifiedAtUtc() != null ? gp.getIdVerifiedAtUtc().toString() : "");
        res.setTotalTrips(gp.getTotalGuidedTrips() != null ? gp.getTotalGuidedTrips() : 0);
        res.setTotalTravelers(0); // placeholder for now since no entity property
        res.setImpactScore(gp.getImpactScore());

        if (Boolean.TRUE.equals(gp.getIdVerified())) {
            res.setVerificationStatus("approved");
        } else if (gp.getVerificationRejectedReason() != null && !gp.getVerificationRejectedReason().isBlank()) {
            res.setVerificationStatus("rejected");
            res.setRejectionReason(gp.getVerificationRejectedReason());
        } else if (gp.getVerificationSubmittedAtUtc() != null) {
            res.setVerificationStatus("pending");
        } else {
            res.setVerificationStatus("not_submitted");
        }

        res.setIdDocumentType(gp.getIdDocumentType());

        return res;
    }

    /**
     * Completes the guide profile.
     *
     * Responsibilities:
     * - Update user identity fields that come from the onboarding form (fullName,
     * phone)
     * - Update guide profile fields (country/city/bio + expertise JSON)
     * - Upsert guide languages
     * - Mark users.profile_completed based on your business rules
     *
     * Notes:
     * - Uses @Transactional so "delete then insert languages" is atomic.
     * If anything fails mid-way, the transaction rolls back and languages won't be
     * wiped.
     * - Uses AccessDeniedException so wrong-role becomes 403 (not 400).
     */
    @PostMapping("/complete")
    @Transactional
    public void complete(@AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody GuideCompleteProfileRequest req) throws Exception {

        // Load current user by email (username in Spring Security).
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Correct HTTP semantics: wrong role => 403
        if (user.getRole() != User.Role.Guide) {
            throw new AccessDeniedException("Forbidden");
        }

        // Find the guide profile row linked to this user
        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile missing"));

        // -------------------------
        // 1) Update identity fields (User table)
        // -------------------------
        user.setFullName(req.getFullName().trim());
        user.setPhoneE164(req.getPhoneE164().trim());
        // You will verify phone later via SMS. Until then, keep false.
        user.setIsPhoneVerified(false);

        // -------------------------
        // 2) Update guide profile fields (GuideProfile table)
        // -------------------------
        gp.setBaseCountry(req.getCountry().trim());
        gp.setBaseCity(req.getCity().trim());
        gp.setBio(req.getBio().trim());

        if (req.getExpertise() != null) {
            // Store expertise as JSON to keep schema flexible.
            gp.setExpertiseJson(objectMapper.writeValueAsString(req.getExpertise()));
        }

        guideProfileRepository.save(gp);

        // -------------------------
        // 3) Upsert guide languages
        // -------------------------
        // Current approach: delete existing rows then insert new ones.
        // Because the method is @Transactional, this is safe.
        guideLanguageRepository.deleteByGuide_Id(gp.getId());

        for (GuideCompleteProfileRequest.LanguageItem item : req.getLanguages()) {
            String langName = item.getName().trim();

            // Find language by name (case-insensitive). If missing, create it.
            // IMPORTANT: DB column languages.code is VARCHAR(5) NOT NULL,
            // so we must generate a short code (2–5 chars) and avoid collisions.
            Language lang = languageRepository.findByNameIgnoreCase(langName)
                    .orElseGet(() -> createLanguageSafely(langName));

            // Create join row guide_languages with composite key
            GuideLanguage gl = new GuideLanguage();
            gl.setGuide(gp);
            gl.setLanguage(lang);
            gl.setId(new GuideLanguageId(gp.getId(), lang.getId()));
            gl.setProficiency(item.getProficiency().trim());

            guideLanguageRepository.save(gl);
        }

        // -------------------------
        // 4) Decide if profile is complete
        // -------------------------
        // Your rule: guide profile completion requires agreements + identity fields +
        // bio/location + ID docs submitted.
        boolean agreementsOk = isTrue(user.getAgreedToTerms()) &&
                isTrue(user.getAgreedToPrivacy()) &&
                user.getAgreementsAcceptedAtUtc() != null;

        boolean requiredOk = notBlank(user.getFullName()) &&
                notBlank(user.getPhoneE164()) &&
                notBlank(gp.getBaseCountry()) &&
                notBlank(gp.getBaseCity()) &&
                notBlank(gp.getBio()) &&
                req.getLanguages() != null &&
                !req.getLanguages().isEmpty();

        // Use new verification fields, but allow legacy fallback for older schema.
        boolean idSubmitted = hasSubmittedIdDocs(gp);

        user.setProfileCompleted(agreementsOk && requiredOk && idSubmitted);
        userRepository.save(user);
    }

    /**
     * Creates a Language row that satisfies:
     * - code NOT NULL
     * - code <= 5 chars (VARCHAR(5))
     * - code unique (if your DB has unique constraint)
     *
     * Strategy:
     * - generate base code from the language name (usually first 2 letters)
     * - if code exists, try base+1, base+2, ... (still <= 5 chars)
     */
    private Language createLanguageSafely(String langName) {
        String base = generateLanguageCode(langName); // e.g. "AR", "EN", "FR"

        for (int i = 0; i < 100; i++) {
            String candidate = (i == 0) ? base : (base + i);

            // Ensure it never exceeds VARCHAR(5)
            if (candidate.length() > 5) {
                candidate = candidate.substring(0, 5);
            }

            // If code isn't used, create the language row
            if (languageRepository.findByCodeIgnoreCase(candidate).isEmpty()) {
                Language l = new Language();
                l.setName(langName);
                l.setCode(candidate);
                return languageRepository.save(l);
            }
        }

        throw new IllegalStateException("Could not generate a unique language code for: " + langName);
    }

    /**
     * Generates a short code that fits VARCHAR(5).
     * Examples:
     * - "Arabic" -> "AR"
     * - "English" -> "EN"
     * - "French" -> "FR"
     * - Weird input -> "LANG"
     */
    private static String generateLanguageCode(String name) {
        String letters = (name == null) ? "" : name.trim().toUpperCase().replaceAll("[^A-Z]", "");
        if (letters.length() >= 2)
            return letters.substring(0, 2);
        if (letters.length() == 1)
            return letters + "X";
        return "LANG";
    }

    /**
     * Checks whether the guide has submitted ID docs.
     * Uses the new fields:
     * - idFrontImage
     * - idBackImage (required for NATIONAL_ID)
     * - selfieImage
     * - idDocumentType
     *
     * Also supports legacy idVerificationImage as a fallback for older data.
     */
    private static boolean hasSubmittedIdDocs(GuideProfile gp) {
        boolean hasFront = notBlank(gp.getIdFrontImage()) || notBlank(gp.getIdVerificationImage());
        boolean hasSelfie = notBlank(gp.getSelfieImage());

        if (!hasFront || !hasSelfie)
            return false;

        String docType = gp.getIdDocumentType() == null ? "" : gp.getIdDocumentType().trim();

        if ("NATIONAL_ID".equalsIgnoreCase(docType)) {
            // National ID requires back image
            return notBlank(gp.getIdBackImage());
        }

        // Passport or unknown: back optional
        return true;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static boolean isTrue(Boolean b) {
        return b != null && b;
    }
}