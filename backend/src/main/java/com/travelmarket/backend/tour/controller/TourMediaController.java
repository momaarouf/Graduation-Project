package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.dto.request.AddTourMediaRequest;
import com.travelmarket.backend.tour.dto.response.TourMediaResponse;
import com.travelmarket.backend.tour.service.TourMediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/guide")
@RequiredArgsConstructor
public class TourMediaController {

    private final TourMediaService mediaService;
    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;

    @PostMapping("/tours/{id}/media")
    public TourMediaResponse addMedia(
            @PathVariable("id") Long templateId,
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody AddTourMediaRequest request) {

        Long guideId = getGuideProfileId(principal);
        return mediaService.addMedia(templateId, guideId, request);
    }

    @DeleteMapping("/media/{mediaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMedia(
            @PathVariable("mediaId") Long mediaId,
            @AuthenticationPrincipal UserDetails principal) {

        Long guideId = getGuideProfileId(principal);
        mediaService.deleteMedia(mediaId, guideId);
    }

    private Long getGuideProfileId(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole() != User.Role.Guide) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only guides can manage tour media");
        }

        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide profile not found"));

        return gp.getId();
    }
}
