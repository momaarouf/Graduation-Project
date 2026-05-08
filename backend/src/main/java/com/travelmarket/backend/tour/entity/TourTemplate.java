package com.travelmarket.backend.tour.entity;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.tour.enums.RecurrencePattern;
import com.travelmarket.backend.tour.enums.TourTemplateStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a reusable, guide-owned definition of a tour.
 *
 * A TourTemplate is the master record — it holds the tour concept, pricing,
 * location, and media. Actual scheduled runs are modelled as TourOccurrence
 * rows that reference this template.
 *
 * Lifecycle (enforced by TourTemplateService, not at DB level):
 *   DRAFT → PENDING_REVIEW → PUBLISHED ↔ PAUSED → ARCHIVED
 *                         ↘ REJECTED  → PENDING_REVIEW (after guide edits)
 *
 * Soft delete: set deleted_at_utc; never hard-delete.
 * FK column name is guide_id to match the V1 schema.
 */
@Entity
@Table(name = "tour_templates")
@Getter
@Setter
public class TourTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Owner — must be a verified guide profile
    // Column name is guide_id to match V1 schema (not guide_profile_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id", nullable = false)
    private GuideProfile guide;

    // ── Core content ───────────────────────────────────────────────────────────

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Short teaser shown on public listing cards and portfolio
    @Column(name = "short_description", length = 500)
    private String shortDescription;

    // Category for browsing and filtering (e.g. "Historical", "Adventure")
    @Column(length = 100)
    private String category;

    // ── Location ───────────────────────────────────────────────────────────────

    @Column(name = "location_name", length = 255)
    private String locationName;

    // Geographic region for filtering (e.g. "North Lebanon", "Bekaa Valley")
    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String city;

    // ISO 3166-1 alpha-2 country code; Lebanon-first default
    @Column(name = "country_code", nullable = false, length = 5)
    private String countryCode = "LB";

    // Meeting point shown to booked travelers
    @Column(name = "meeting_point_name", length = 255)
    private String meetingPointName;

    // Coordinates for future map UI
    @Column(name = "meeting_latitude", precision = 10, scale = 8)
    private BigDecimal meetingLatitude;

    @Column(name = "meeting_longitude", precision = 11, scale = 8)
    private BigDecimal meetingLongitude;

    @Column(name = "meeting_point_address", length = 500)
    private String meetingPointAddress;

    @Column(name = "meeting_point_instructions", columnDefinition = "TEXT")
    private String meetingPointInstructions;

    // ── Content Arrays & Itinerary ─────────────────────────────────────────────

    // JSON string representation of the itinerary array
    @Column(columnDefinition = "TEXT")
    private String itinerary;

    // JSON string representation of arrays
    @Column(columnDefinition = "TEXT")
    private String inclusions;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String whatToBring;

    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(columnDefinition = "TEXT")
    private String languages;

    // ── Pricing ────────────────────────────────────────────────────────────────

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    // Currency for base_price; Lebanon market defaults to USD
    @Column(nullable = false, length = 3)
    private String currency = "USD";

    // ── Capacity ───────────────────────────────────────────────────────────────

    @Column(name = "min_capacity", nullable = false)
    private Integer minCapacity;

    @Column(name = "max_capacity", nullable = false)
    private Integer maxCapacity;

    @Column(name = "duration_hours")
    private Integer durationHours = 2;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 0;

    // ── Booking behaviour ──────────────────────────────────────────────────────

    // TRUE = traveler books instantly without guide confirmation
    private Boolean instantBook = false;
    
    @Column(name = "start_date_utc")
    private Instant startDate;

    // ── Recurrence ─────────────────────────────────────────────────────────────

    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    // Stored as string to match RecurrencePattern enum values
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_pattern", length = 50)
    private RecurrencePattern recurrencePattern = RecurrencePattern.NONE;

    @Column(name = "recurring_days", length = 255)
    private String recurringDays;

    @Column(name = "recurring_until")
    private Instant recurringUntil;

    @Column(name = "recurring_dates", columnDefinition = "TEXT")
    private String recurringDates;

    @Column(name = "excluded_dates", columnDefinition = "TEXT")
    private String excludedDates;

    // ── Trust & filters ────────────────────────────────────────────────────────

    // Halal-friendly badge shown on public listings (renamed from halal_badge in V17)
    @Column(name = "halal_friendly")
    private Boolean halalFriendly = false;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private java.math.BigDecimal averageRating = java.math.BigDecimal.ZERO;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "is_premium")
    private Boolean isPremium = false;

    @Column(name = "is_family_friendly")
    private Boolean isFamilyFriendly = true;

    @Column(name = "has_group_discount")
    private Boolean hasGroupDiscount = false;

    // JSON string representation of dynamic pricing rules
    @Column(name = "dynamic_pricing", columnDefinition = "TEXT")
    private String dynamicPricing;

    @Column(name = "group_discount_threshold")
    private Integer groupDiscountThreshold;

    @Column(name = "group_discount_percent", precision = 5, scale = 2)
    private java.math.BigDecimal groupDiscountPercent;

    // JSON string representation of expanded halal details (food, prayer, etc.)
    @Column(name = "halal_details", columnDefinition = "TEXT")
    private String halalDetails;

    // ── Status & visibility ────────────────────────────────────────────────────

    // Full lifecycle status — see TourTemplateStatus Javadoc for state machine
    // Guide can NEVER set this directly to PUBLISHED; only admin can do that
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TourTemplateStatus status = TourTemplateStatus.DRAFT;

    // Soft enable/disable independent of status (reserved for admin tooling)
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // ── Portfolio ──────────────────────────────────────────────────────────────

    /**
     * Timestamp of the last time admin approved this tour.
     * Two roles:
     *  1. Portfolio eligibility — a tour only appears in the guide's public
     *     portfolio if this is NOT NULL (was vetted at least once).
     *  2. Occurrence visibility during re-review — if this is set, the tour
     *     was previously published, so its occurrences stay visible to the
     *     public even while status = PENDING_REVIEW.
     * Set by TourTemplateService.approve(); never set by the guide.
     */
    @Column(name = "last_published_at_utc")
    private Instant lastPublishedAtUtc;

    // Guide can opt a specific tour out of their portfolio (defaults to visible)
    @Column(name = "show_in_portfolio", nullable = false)
    private Boolean showInPortfolio = true;

    // ── Admin review ───────────────────────────────────────────────────────────

    // Written by admin when rejecting; cleared when guide resubmits for review
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // ── Safety rules ───────────────────────────────────────────────────────────

    /**
     * When TRUE, an automated job will soft-cancel any occurrence and notify
     * travelers if min_capacity is not met 48 hours before start_time_utc.
     * Guide can set this to FALSE to disable the safety net for this tour.
     * The automation job itself is implemented in a future card.
     */
    @Column(name = "auto_cancel_if_min_not_met", nullable = false)
    private Boolean autoCancelIfMinNotMet = true;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<TourMedia> media = new java.util.ArrayList<>();

    public java.util.List<TourMedia> getMedia() {
        return media;
    }

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    // Soft delete — never hard-delete tour templates
    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

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