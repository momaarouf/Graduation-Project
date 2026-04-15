package com.travelmarket.backend.entity;

import com.travelmarket.backend.booking.enums.LoyaltyTier;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "traveler_profiles")
@Getter
@Setter
public class TravelerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /**
     * Current loyalty tier of this traveler.
     * Automatically recalculated by {@code PricingService.recalculateLoyaltyTier()}
     * whenever a booking transitions to COMPLETED.
     * Stored as an uppercase string (BRONZE / SILVER / GOLD) via {@code EnumType.STRING}.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "loyalty_tier", length = 20)
    private LoyaltyTier loyaltyTier = LoyaltyTier.BRONZE;

    @Column(name = "streak_count")
    private Integer streakCount = 0;

    @Column(name = "review_reminder_enabled")
    private Boolean reviewReminderEnabled = true;

    @Column(name = "total_completed_trips")
    private Integer totalCompletedTrips = 0;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc")
    private Instant updatedAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    @Column(name = "home_country", length = 60)
    private String homeCountry;

    @Column(name = "home_city", length = 80)
    private String homeCity;

    @Column(name = "nationality", length = 80)
    private String nationality;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "travel_preferences_json")
    private String travelPreferencesJson;

    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

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