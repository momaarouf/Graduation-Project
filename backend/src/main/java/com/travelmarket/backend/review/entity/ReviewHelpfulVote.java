package com.travelmarket.backend.review.entity;

import com.travelmarket.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Entity to track "Helpful" votes (likes) on reviews.
 * One user can like a review only once.
 */
@Entity
@Table(
        name = "review_helpful_votes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_review_user_helpful", columnNames = {"review_id", "user_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewHelpfulVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
