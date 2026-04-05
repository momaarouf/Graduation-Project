package com.travelmarket.backend.review.entity;

import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Review entity — one per completed booking.
 *
 * Trust rules (enforced in ReviewService):
 *   - Only the traveler who owns the booking may create a review
 *   - Booking must be in COMPLETED status
 *   - UNIQUE constraint on booking_id prevents duplicate reviews
 *
 * Future-ready fields (nullable, zero-cost now):
 *   - guideReply / guideRepliedAt   → guide response card
 *   - isHidden / hiddenReason       → admin moderation
 *   - reportCount                   → abuse reporting
 */
@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                // Core trust anchor: one review per booking, enforced at DB level
                @UniqueConstraint(name = "uq_reviews_booking_id", columnNames = "booking_id")
        },
        indexes = {
                // Fast filtering by guide (public guide profile page)
                @Index(name = "idx_reviews_guide_id",          columnList = "guide_id"),
                // Fast filtering by tour (public tour detail page)
                @Index(name = "idx_reviews_tour_template_id",  columnList = "tour_template_id"),
                // Fast "my reviews" list for traveler dashboard
                @Index(name = "idx_reviews_traveler_id",       columnList = "traveler_id"),
                // Exclude hidden reviews from public queries
                @Index(name = "idx_reviews_is_hidden",         columnList = "is_hidden")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Core FK references ────────────────────────────────────────────────

    /** The completed booking being reviewed. UNIQUE — prevents duplicate reviews. */
    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    /** Traveler who wrote the review. Denormalized from booking for fast queries. */
    @Column(name = "traveler_id", nullable = false)
    private Long travelerId;

    /** Guide who led the tour. Denormalized from booking for fast queries. */
    @Column(name = "guide_id", nullable = false)
    private Long guideId;

    /** Tour template (the "listing"). Used for tour-level aggregation. */
    @Column(name = "tour_template_id", nullable = false)
    private Long tourTemplateId;

    /** Specific occurrence that was booked. Used to retrieve the tour date. */
    @Column(name = "occurrence_id", nullable = false)
    private Long occurrenceId;

    // ── Relationships (Read-only) ────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", insertable = false, updatable = false)
    private TravelerProfile traveler;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occurrence_id", insertable = false, updatable = false)
    private TourOccurrence occurrence;

    // ── Four sub-ratings (1–5 each) ───────────────────────────────────────
    // Stored as SMALLINT in Postgres (original schema) → must use Short in Java.
    // Using Integer here would cause Hibernate schema validation to fail:
    //   "found [int2 (SMALLINT)], but expecting [integer (INTEGER)]"
    // Bean Validation (@Min/@Max) fires before we even hit the DB.

    /** Overall impression — the primary rating used for aggregation. */
    @Column(name = "rating_overall", nullable = false)
    private Short ratingOverall;

    /** Guide Performance — knowledge, communication, punctuality. */
    @Column(name = "rating_guide", nullable = false)
    private Short ratingGuide;

    /** Tour Experience — itinerary quality, pacing, locations. */
    @Column(name = "rating_tour", nullable = false)
    private Short ratingTour;

    /** Value for Money — price vs. experience delivered. */
    @Column(name = "rating_value", nullable = false)
    private Short ratingValue;

    // ── Review content ────────────────────────────────────────────────────

    /** Optional free-text comment. Max 1000 chars enforced in DTO. */
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    // ── Timestamps ────────────────────────────────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Updated when guide replies or admin hides. Tracks edit window in future. */
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ── Future-ready: Guide reply ─────────────────────────────────────────

    /** Guide's public response to this review. Null until guide replies. */
    @Column(name = "guide_reply", columnDefinition = "TEXT")
    private String guideReply;

    @Column(name = "guide_replied_at")
    private Instant guideRepliedAt;

    // ── Future-ready: Admin moderation ───────────────────────────────────

    /** Hidden reviews are excluded from all public responses. */
    @Column(name = "is_hidden", nullable = false)
    @Builder.Default
    private boolean hidden = false;

    /** Reason recorded when admin hides a review. */
    @Column(name = "hidden_reason")
    private String hiddenReason;

    // ── Future-ready: Abuse reporting ────────────────────────────────────

    /** Incremented each time a user reports this review. */
    @Column(name = "report_count", nullable = false)
    @Builder.Default
    private int reportCount = 0;

    /** Number of travelers who found this review helpful. Denormalized for performance. */
    @Column(name = "helpful_count", nullable = false)
    @Builder.Default
    private long helpfulCount = 0L;

    // ── Lifecycle hooks ──────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}