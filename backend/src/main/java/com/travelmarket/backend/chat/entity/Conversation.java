package com.travelmarket.backend.chat.entity;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.tour.entity.TourTemplate;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "conversations")
@Getter
@Setter
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The traveler who initiated or is part of this chat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private User traveler;

    // The guide answering the query
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id", nullable = false)
    private User guide;

    // The specific tour template this conversation is about
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private TourTemplate tour;

    // Optional booking context if the traveler has already booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

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
