package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.entity.WishlistItem;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import com.travelmarket.backend.tour.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final TourTemplateRepository tourTemplateRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addToWishlist(Long userId, Long tourId) {
        if (wishlistRepository.existsByUserIdAndTourTemplateId(userId, tourId)) {
            return; // Already in wishlist
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        TourTemplate tour = tourTemplateRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setTourTemplate(tour);
        
        wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long tourId) {
        wishlistRepository.deleteByUserIdAndTourTemplateId(userId, tourId);
    }

    @Transactional(readOnly = true)
    public List<Long> getWishlistTourIds(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(item -> item.getTourTemplate().getId())
                .toList();
    }
}
