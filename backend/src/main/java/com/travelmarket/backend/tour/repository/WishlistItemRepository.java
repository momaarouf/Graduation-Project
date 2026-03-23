package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    
    List<WishlistItem> findByUserId(Long userId);
    
    Optional<WishlistItem> findByUserIdAndTourTemplateId(Long userId, Long tourTemplateId);
    
    boolean existsByUserIdAndTourTemplateId(Long userId, Long tourTemplateId);
    
    void deleteByUserIdAndTourTemplateId(Long userId, Long tourTemplateId);
}
