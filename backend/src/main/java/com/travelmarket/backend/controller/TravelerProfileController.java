package com.travelmarket.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelmarket.backend.dto.TravelerCompleteProfileRequest;
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

@RestController
@RequestMapping("/api/traveler/profile")
@RequiredArgsConstructor
public class TravelerProfileController {

    private final UserRepository userRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/complete")
    public void complete(@AuthenticationPrincipal UserDetails principal,
                         @Valid @RequestBody TravelerCompleteProfileRequest req) throws Exception {

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != User.Role.Traveler) {
            //  correct 403 (instead of RuntimeException -> 400)
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }

        TravelerProfile tp = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile missing"));

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
                // becomes 400 via your exception handler (IllegalArgumentException is better than a 500)
                throw new IllegalArgumentException("dateOfBirth must be in YYYY-MM-DD format");
            }
        }

        if (req.getPreferences() != null) {
            tp.setTravelPreferencesJson(objectMapper.writeValueAsString(req.getPreferences()));
        }

        travelerProfileRepository.save(tp);

        // Profile completion rule (Traveler): agreements + name + phone + location
        boolean completed =
                isTrue(user.getAgreedToTerms()) &&
                        isTrue(user.getAgreedToPrivacy()) &&
                        notBlank(user.getFullName()) &&
                        notBlank(user.getPhoneE164()) &&
                        notBlank(tp.getHomeCountry()) &&
                        notBlank(tp.getHomeCity());

        user.setProfileCompleted(completed);
        userRepository.save(user);
    }

    private static boolean notBlank(String s) { return s != null && !s.trim().isEmpty(); }
    private static boolean isTrue(Boolean b) { return b != null && b; }
}