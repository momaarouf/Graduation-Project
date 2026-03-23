package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.response.PublicTourCardResponse;
import com.travelmarket.backend.tour.service.PublicTourService;
import com.travelmarket.backend.tour.service.WishlistService;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final PublicTourService publicTourService;
    private final UserRepository userRepository;

    private Long getCurrentUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow();
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getWishlistIds(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        return ResponseEntity.ok(wishlistService.getWishlistTourIds(userId));
    }

    @GetMapping
    public ResponseEntity<List<PublicTourCardResponse>> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getCurrentUserId(userDetails);
        List<Long> ids = wishlistService.getWishlistTourIds(userId);
        return ResponseEntity.ok(publicTourService.getTourCards(ids));
    }

    @PostMapping("/{tourId}")
    public ResponseEntity<Void> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tourId
    ) {
        Long userId = getCurrentUserId(userDetails);
        wishlistService.addToWishlist(userId, tourId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tourId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tourId
    ) {
        Long userId = getCurrentUserId(userDetails);
        wishlistService.removeFromWishlist(userId, tourId);
        return ResponseEntity.ok().build();
    }
}
