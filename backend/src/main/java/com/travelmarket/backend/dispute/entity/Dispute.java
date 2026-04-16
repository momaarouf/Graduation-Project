package com.travelmarket.backend.dispute.entity;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.dispute.enums.DisputeReason;
import com.travelmarket.backend.dispute.enums.DisputeStatus;
import com.travelmarket.backend.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a dispute opened against a specific Booking.
 * A dispute involves two users: the one who opened it (openedByUser) and the
 * one being disputed against (againstUser).
 */
@Entity
@Table(name = "disputes")
@Getter
@Setter
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The booking in question. UNIQUE constraint in DB ensures 1 active dispute per booking.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    // User who initiated the dispute (Traveler or Guide)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opened_by_user_id", nullable = false)
    private User openedByUser;

    // User the dispute is against
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "against_user_id", nullable = false)
    private User againstUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DisputeReason reason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "against_user_response", columnDefinition = "TEXT")
    private String againstUserResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisputeStatus status = DisputeStatus.OPEN;

    @Column(name = "resolution_note", columnDefinition = "TEXT")
    private String resolutionNote;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
        updatedAtUtc = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAtUtc = Instant.now();
    }
}
