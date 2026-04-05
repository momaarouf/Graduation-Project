package com.travelmarket.backend.review.repository;

import com.travelmarket.backend.review.entity.ReviewHelpfulVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVote, Long> {

    /**
     * Finds a vote by review and user.
     * Used to toggle the helpful status or check if a user has already liked.
     */
    Optional<ReviewHelpfulVote> findByReviewIdAndUserId(Long reviewId, Long userId);

    /**
     * Checks if a user has marked a review as helpful.
     */
    boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

    /**
     * Removes a vote. Used when a user un-likes a review.
     */
    void deleteByReviewIdAndUserId(Long reviewId, Long userId);
}
