package com.travelmarket.backend.booking.entity;

import com.travelmarket.backend.booking.enums.BookingMode;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.entity.PromoCode;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * A Booking represents one traveler's reservation of seats on a TourOccurrence.
 *
 * ── Ownership ──────────────────────────────────────────────────────────────
 * A Booking belongs to exactly one TravelerProfile and one TourOccurrence.
 * The guide is reached transitively via occurrence → template → guide,
 * never stored denormalized here (avoids stale FK if guide transfers occur).
 *
 * ── Status lifecycle ───────────────────────────────────────────────────────
 * Instant Book:  created → CONFIRMED (payment intercepts here in future)
 * Request Book:  created → PENDING_GUIDE → CONFIRMED / CANCELLED
 * Both:          CONFIRMED → IN_PROGRESS → COMPLETED
 *                CONFIRMED → CANCELLED (within policy window)
 *
 * ── Pricing snapshots ──────────────────────────────────────────────────────
 * All pricing data is snapshotted at booking time so historical records
 * remain accurate even when the guide later edits the tour pricing.
 *
 * ── Concurrency safety ─────────────────────────────────────────────────────
 * @Version provides JPA optimistic locking. If two booking requests race on
 * the same occurrence, the second writer loses with an OptimisticLockException,
 * which is mapped to HTTP 409 in GlobalExceptionHandler.
 * For higher-volume scenarios, upgrade to pessimistic SELECT FOR UPDATE.
 *
 * ── Future compatibility ───────────────────────────────────────────────────
 * - payment card    : use PENDING_PAYMENT → CONFIRMED flow; add Payment FK
 * - payout card     : completedAtUtc starts 48 h freeze window
 * - no-show card    : checkedInAtUtc vs completedAtUtc difference signals no-show
 * - review card     : COMPLETED status + completedAtUtc unlock review eligibility
 * - dispute card    : cancelled_at_utc + refund_percent feed dispute calculations
 *
 * Soft delete: set deletedAtUtc; never hard-delete.
 */
@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── JPA optimistic locking ──────────────────────────────────────────────
    // Prevents double-booking race conditions during concurrent seat reservation.
    // Stored in the 'version' column added by V38 migration.
    @Version
    @Column(nullable = false)
    private Long version;

    // ── Core relationships ──────────────────────────────────────────────────

    // The specific scheduled run being booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occurrence_id", nullable = false)
    private TourOccurrence occurrence;

    // The traveler making this booking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_id", nullable = false)
    private TravelerProfile traveler;

    // ── Booking mode & status ───────────────────────────────────────────────

    /**
     * Snapshotted from TourTemplate.instantBook at creation time.
     * Instant → skips guide approval; Request → requires guide acceptance.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_mode", length = 20)
    private BookingMode bookingMode;

    // Standard / Private / Custom — reserved for future booking type variants
    @Column(name = "booking_type", length = 20)
    private String bookingType = "Standard";

    /**
     * Current position in the booking lifecycle.
     * See BookingStatus for full transition documentation.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private BookingStatus status;

    // ── Guest details ───────────────────────────────────────────────────────

    @Column(name = "people_count", nullable = false)
    private Integer peopleCount;

    // Traveler has acknowledged waiver / liability terms
    @Column(name = "waiver_signed")
    private Boolean waiverSigned = false;

    // ── Pricing snapshots ───────────────────────────────────────────────────

    // Final amount charged to the traveler after all discounts
    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Column(length = 3)
    private String currency = "USD";

    // Per-person base price at booking time
    @Column(name = "base_price_snapshot", precision = 10, scale = 2)
    private BigDecimal basePriceSnapshot;

    // Dynamic demand multiplier applied at booking time (1.0 = no adjustment)
    @Column(name = "dynamic_multiplier_snapshot", precision = 3, scale = 2)
    private BigDecimal dynamicMultiplierSnapshot;

    // Platform commission taken before payout — feeds cancellation refund calc
    @Column(name = "platform_fee_snapshot", precision = 10, scale = 2)
    private BigDecimal platformFeeSnapshot;

    // ── Discount snapshots ──────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_code_id")
    private PromoCode promoCode;

    // Absolute promo discount applied (e.g. USD 15.00)
    @Column(name = "promo_discount_amount_snapshot", precision = 10, scale = 2)
    private BigDecimal promoDiscountAmountSnapshot;

    // Loyalty tier discount percentage at booking time
    @Column(name = "tier_discount_percent_snapshot", precision = 5, scale = 2)
    private BigDecimal tierDiscountPercentSnapshot;

    // Group booking discount percentage (if peopleCount ≥ template threshold)
    @Column(name = "group_discount_percent_snapshot", precision = 5, scale = 2)
    private BigDecimal groupDiscountPercentSnapshot;

    // ── Cancellation policy ─────────────────────────────────────────────────

    /**
     * Refund percentage determined at cancellation time based on the time window:
     *   > 48 h before start : 100% (minus platform fee)
     *   24–48 h before start: 50%
     *   < 24 h before start : 0%
     *
     * Stored as a snapshot so future payment/dispute cards can compute exact
     * refund amounts without re-evaluating the time window retroactively.
     */
    @Column(name = "refund_percent", precision = 5, scale = 2)
    private BigDecimal refundPercent;

    @Column(name = "cancelled_at_utc")
    private Instant cancelledAtUtc;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    // ── QR / check-in / completion ──────────────────────────────────────────

    /**
     * UUID token used to generate the traveler's check-in QR code.
     * The guide's app encodes this in a QR scan; the backend validates
     * ownership and transitions CONFIRMED → IN_PROGRESS.
     *
     * Never expose this in public / guide-list responses — only in the
     * traveler's own booking detail response.
     */
    @Column(name = "qr_code", unique = true, length = 255)
    private String qrCode;

    // Set when guide scans the QR / marks check-in (CONFIRMED → IN_PROGRESS)
    @Column(name = "checked_in_at_utc")
    private Instant checkedInAtUtc;

    // Set when guide marks the tour complete (IN_PROGRESS → COMPLETED).
    // This timestamp starts the 48 h payout freeze window (future payout card).
    @Column(name = "completed_at_utc")
    private Instant completedAtUtc;

    // ── Cart / session support (future cart-timeout card) ───────────────────

    @Column(name = "cart_id")
    private UUID cartId;

    @Column(name = "cart_expires_at_utc")
    private Instant cartExpiresAtUtc;

    // ── Audit timestamps ────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc", nullable = false)
    private Instant updatedAtUtc;

    // Soft delete — never hard-delete booking records
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