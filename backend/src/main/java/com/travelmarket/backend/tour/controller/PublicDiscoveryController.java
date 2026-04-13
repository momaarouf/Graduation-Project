package com.travelmarket.backend.tour.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelmarket.backend.dto.CategoryDiscoveryResponse;
import com.travelmarket.backend.dto.LocationDiscoveryResponse;
import com.travelmarket.backend.dto.PublicGuideProfileResponse;
import com.travelmarket.backend.dto.PublicStatsResponse;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Public discovery and statistics endpoints.
 * Unified under /api/public for better routing reliability.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDiscoveryController {

    private final TourTemplateRepository tourTemplateRepository;
    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/stats")
    public PublicStatsResponse getStats() {
        return PublicStatsResponse.builder()
                .verifiedGuidesCount(guideProfileRepository.countByIdVerifiedTrueAndDeletedAtUtcIsNull())
                .totalTravelersCount(userRepository.countByRoleAndDeletedAtUtcIsNull(User.Role.Traveler))
                .activeToursCount(tourTemplateRepository.countByStatusAndDeletedAtUtcIsNull(TourTemplateStatus.PUBLISHED))
                .completedToursCount(120) // Placeholder
                .averageRating(new BigDecimal("4.85")) // Placeholder
                .build();
    }

    @GetMapping("/discovery/categories")
    public List<CategoryDiscoveryResponse> getCategories() {
        List<Object[]> results = tourTemplateRepository.countByCategories();
        List<CategoryDiscoveryResponse> list = new ArrayList<>();
        
        for (Object[] res : results) {
            String cat = (String) res[0];
            long count = (long) res[1];
            list.add(CategoryDiscoveryResponse.builder()
                    .id(cat.toLowerCase())
                    .name(cat)
                    .tourCount(count)
                    .imageUrl(getFallbackImageForCategory(cat))
                    .build());
        }
        return list;
    }

    @GetMapping("/discovery/locations")
    public List<LocationDiscoveryResponse> getLocations() {
        List<Object[]> results = tourTemplateRepository.countByCities();
        List<LocationDiscoveryResponse> list = new ArrayList<>();
        
        for (Object[] res : results) {
            String city = (String) res[0];
            long count = (long) res[1];
            list.add(LocationDiscoveryResponse.builder()
                    .name(city)
                    .tourCount(count)
                    .imageUrl(getFallbackImageForCity(city))
                    .build());
        }
        return list;
    }

    @GetMapping("/discovery/guides")
    public List<PublicGuideProfileResponse> getGuides() throws Exception {
        return guideProfileRepository.findVerifiedGuides().stream()
                .map(gp -> {
                    PublicGuideProfileResponse res = new PublicGuideProfileResponse();
                    res.setId(gp.getId());
                    res.setName(gp.getUser().getFullName());
                    res.setTagline(gp.getTagline());
                    res.setAvatarUrl(gp.getAvatarUrl());
                    res.setCoverImageUrl(gp.getCoverImageUrl());
                    res.setCity(gp.getBaseCity());
                    res.setCountry(gp.getBaseCountry());
                    res.setTourCount(gp.getTourCount());
                    res.setTotalGuidedTrips(gp.getTotalGuidedTrips());
                    res.setVerified(Boolean.TRUE.equals(gp.getIdVerified()));
                    res.setMemberSince(gp.getCreatedAtUtc() != null ? gp.getCreatedAtUtc().toString() : "");

                    // Map expertise from JSON
                    if (gp.getExpertiseJson() != null && !gp.getExpertiseJson().isBlank()) {
                        try {
                            res.setExpertise(objectMapper.readValue(gp.getExpertiseJson(), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {}));
                        } catch (Exception e) {
                            res.setExpertise(List.of());
                        }
                    } else {
                        res.setExpertise(List.of());
                    }

                    return res;
                })
                .collect(Collectors.toList());
    }

    private String getFallbackImageForCategory(String category) {
        if (category == null) {
            return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800";
        }
        return switch (category.toLowerCase()) {
            case "halal" -> "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800";
            case "history", "heritage" -> "https://images.unsplash.com/photo-1523496929152-416a4a9218d6?auto=format&fit=crop&q=80&w=800";
            case "food", "culinary" -> "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800";
            case "nature", "adventure", "hiking" -> "https://images.unsplash.com/photo-1551632432-c735e5fa7577?auto=format&fit=crop&q=80&w=800";
            default -> "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800";
        };
    }

    private String getFallbackImageForCity(String city) {
        if (city == null) {
            return "https://images.unsplash.com/photo-1493246507139-91e8bef99c17?auto=format&fit=crop&q=80&w=1200";
        }
        return switch (city.toLowerCase()) {
            case "beirut" -> "https://images.unsplash.com/photo-1547448415-38933c10156d?auto=format&fit=crop&q=80&w=1200";
            case "istanbul" -> "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1200";
            default -> "https://images.unsplash.com/photo-1493246507139-91e8bef99c17?auto=format&fit=crop&q=80&w=1200";
        };
    }
}
