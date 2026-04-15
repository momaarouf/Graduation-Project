package com.travelmarket.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.travelmarket.backend.booking.enums.LoyaltyTier;
import com.travelmarket.backend.booking.service.PricingService;
import com.travelmarket.backend.config.LoyaltyProperties;
import com.travelmarket.backend.dto.LoyaltyStatusResponse;
import com.travelmarket.backend.dto.TravelerCompleteProfileRequest;
import com.travelmarket.backend.dto.TravelerProfileResponse;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/traveler/profile")
@RequiredArgsConstructor
public class TravelerProfileController {

    private final UserRepository userRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final ObjectMapper objectMapper;
    /** Provides tier logic (thresholds, discount pcts, progress helpers). */
    private final PricingService pricingService;
    /** Raw config values for "next tier" discount preview. */
    private final LoyaltyProperties loyaltyProperties;

    @GetMapping
    public TravelerProfileResponse getProfile(@AuthenticationPrincipal UserDetails principal) throws Exception {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Traveler) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        TravelerProfile tp = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile missing"));

        return mapToResponse(user, tp);
    }

    @PostMapping("/complete")
    public TravelerProfileResponse complete(@AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody TravelerCompleteProfileRequest req) throws Exception {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Traveler) {
            // correct 403 (instead of RuntimeException -> 400)
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        TravelerProfile tp = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile missing"));

        // Check for duplicate phone number
        String newPhone = req.getPhoneE164().trim();
        User existingUserWithPhone = userRepository.findByPhoneE164(newPhone);
        if (existingUserWithPhone != null && !existingUserWithPhone.getId().equals(user.getId())) {
            throw new IllegalArgumentException("This phone number is already associated with another account.");
        }

        // Update shared identity fields (editable)
        user.setFullName(req.getFullName().trim());
        user.setPhoneE164(req.getPhoneE164().trim());
        user.setIsPhoneVerified(false); // SMS later

        // Update traveler profile fields
        tp.setHomeCountry(req.getCountry().trim());
        tp.setHomeCity(req.getCity().trim());
        tp.setNationality(req.getNationality());

        if (req.getDateOfBirth() != null && !req.getDateOfBirth().isBlank()) {
            try {
                tp.setDateOfBirth(LocalDate.parse(req.getDateOfBirth()));
            } catch (java.time.format.DateTimeParseException e) {
                // becomes 400 via your exception handler (IllegalArgumentException is better
                // than a 500)
                throw new IllegalArgumentException("dateOfBirth must be in YYYY-MM-DD format");
            }
        }

        if (req.getPreferences() != null) {
            tp.setTravelPreferencesJson(objectMapper.writeValueAsString(req.getPreferences()));
        }

        // New fields
        tp.setTagline(req.getTagline());
        tp.setBio(req.getBio());
        tp.setAvatarUrl(req.getAvatarUrl());
        tp.setCoverImageUrl(req.getCoverImageUrl());
        
        tp = travelerProfileRepository.save(tp);

        // Profile completion rule (Traveler): agreements + name + phone + location
        boolean completed = isTrue(user.getAgreedToTerms()) &&
                isTrue(user.getAgreedToPrivacy()) &&
                notBlank(user.getFullName()) &&
                notBlank(user.getPhoneE164()) &&
                notBlank(tp.getHomeCountry()) &&
                notBlank(tp.getHomeCity());

        user.setProfileCompleted(completed);
        user = userRepository.save(user);

        return mapToResponse(user, tp);
    }

    private TravelerProfileResponse mapToResponse(User user, TravelerProfile tp) throws Exception {
        TravelerProfileResponse res = new TravelerProfileResponse();
        res.setFullName(user.getFullName());
        res.setPhoneE164(user.getPhoneE164());
        res.setCountry(tp.getHomeCountry());
        res.setCity(tp.getHomeCity());
        res.setNationality(tp.getNationality());

        if (tp.getDateOfBirth() != null) {
            res.setDateOfBirth(tp.getDateOfBirth().toString());
        }

        if (tp.getTravelPreferencesJson() != null && !tp.getTravelPreferencesJson().isBlank()) {
            res.setPreferences(objectMapper.readValue(tp.getTravelPreferencesJson(), new TypeReference<List<String>>() {}));
        } else {
            res.setPreferences(List.of());
        }

        res.setEmail(user.getEmail());
        res.setEmailVerified(user.getIsEmailVerified());
        res.setPhoneVerified(user.getIsPhoneVerified());
        res.setMemberSince(user.getCreatedAtUtc() != null ? user.getCreatedAtUtc().toString() : "");
        res.setLoyaltyTier(tp.getLoyaltyTier() != null ? tp.getLoyaltyTier().name() : LoyaltyTier.BRONZE.name());
        res.setCompletedTrips(tp.getTotalCompletedTrips() != null ? tp.getTotalCompletedTrips() : 0);
        res.setReviewReminderEnabled(tp.getReviewReminderEnabled() != null ? tp.getReviewReminderEnabled() : false);
        res.setNewsletterOptIn(user.getNewsletterOptIn() != null ? user.getNewsletterOptIn() : false);
        
        res.setTagline(tp.getTagline());
        res.setBio(tp.getBio());
        res.setAvatarUrl(tp.getAvatarUrl());
        res.setCoverImageUrl(tp.getCoverImageUrl());

        return res;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static boolean isTrue(Boolean b) {
        return b != null && b;
    }

    // ── Loyalty Status ────────────────────────────────────────────────────────

    /**
     * Returns the authenticated traveler's full loyalty status.
     *
     * Response includes:
     *   - Current tier (BRONZE / SILVER / GOLD)
     *   - Discount % they earn today
     *   - Number of completed trips
     *   - Trips needed to reach the next tier (0 if already GOLD)
     *   - Preview of the next tier and its discount rate
     *
     * GET /api/traveler/profile/loyalty
     */
    @GetMapping("/loyalty")
    public LoyaltyStatusResponse getLoyaltyStatus(
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Traveler) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        TravelerProfile tp = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile missing"));

        // Resolve current tier (fallback to BRONZE for new travelers)
        LoyaltyTier currentTier = tp.getLoyaltyTier() != null ? tp.getLoyaltyTier() : LoyaltyTier.BRONZE;
        int completedTrips = tp.getTotalCompletedTrips() != null ? tp.getTotalCompletedTrips() : 0;

        // Discount % for current tier (from configurable LoyaltyProperties)
        java.math.BigDecimal currentDiscountPct = pricingService.getTierDiscountPct(currentTier);

        // Trips to next tier and next tier info
        int tripsToNext = pricingService.tripsToNextTier(tp);
        LoyaltyTier next = pricingService.nextTier(currentTier);
        java.math.BigDecimal nextDiscountPct = next != null ? pricingService.getTierDiscountPct(next) : null;

        return LoyaltyStatusResponse.builder()
                .loyaltyTier(currentTier.name())
                .discountPct(currentDiscountPct)
                .completedTrips(completedTrips)
                .tripsToNextTier(tripsToNext)
                .nextTier(next != null ? next.name() : null)
                .nextTierDiscountPct(nextDiscountPct)
                .build();
    }
}