package com.travelmarket.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelmarket.backend.dto.PublicTravelerProfileResponse;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/public/travelers")
@RequiredArgsConstructor
public class PublicTravelerController {

    private final TravelerProfileRepository travelerProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/{id}")
    public ResponseEntity<PublicTravelerProfileResponse> getPublicProfile(@PathVariable Long id) {
        TravelerProfile tp = travelerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Traveler not found"));

        User user = tp.getUser();

        PublicTravelerProfileResponse res = new PublicTravelerProfileResponse();
        res.setId(tp.getId());
        res.setFullName(user.getFullName());
        res.setTagline(tp.getTagline());
        res.setBio(tp.getBio());
        res.setAvatarUrl(tp.getAvatarUrl());
        res.setCoverImageUrl(tp.getCoverImageUrl());
        
        String location = "";
        if (tp.getHomeCity() != null && !tp.getHomeCity().isBlank()) {
            location = tp.getHomeCity();
        }
        if (tp.getHomeCountry() != null && !tp.getHomeCountry().isBlank()) {
            location = location.isEmpty() ? tp.getHomeCountry() : location + ", " + tp.getHomeCountry();
        }
        res.setLocation(location);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy").withZone(ZoneId.of("UTC"));
        res.setMemberSince(formatter.format(user.getCreatedAtUtc()));

        res.setLoyaltyTier(tp.getLoyaltyTier() != null ? tp.getLoyaltyTier() : "Bronze");
        res.setCompletedTrips(tp.getTotalCompletedTrips() != null ? tp.getTotalCompletedTrips() : 0);

        try {
            if (tp.getTravelPreferencesJson() != null) {
                List<String> prefs = objectMapper.readValue(tp.getTravelPreferencesJson(), new TypeReference<List<String>>() {});
                res.setPreferences(prefs);
            } else {
                res.setPreferences(Collections.emptyList());
            }
        } catch (Exception e) {
            res.setPreferences(Collections.emptyList());
        }

        res.setEmailVerified(user.getIsEmailVerified());
        res.setPhoneVerified(user.getIsPhoneVerified());

        return ResponseEntity.ok(res);
    }
}
