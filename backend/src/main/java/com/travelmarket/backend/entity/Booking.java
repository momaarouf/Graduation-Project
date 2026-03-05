package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "occurrence_id", nullable = false)
    private TourOccurrence occurrence;

    @ManyToOne
    @JoinColumn(name = "traveler_id", nullable = false)
    private TravelerProfile traveler;

    @Column(name = "booking_mode")
    private String bookingMode; // Instant, Request

    @Column(name = "booking_type")
    private String bookingType = "Standard"; // Standard, Private, Custom

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "people_count", nullable = false)
    private Integer peopleCount;

    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice;

    private String currency = "USD";

    @Column(name = "waiver_signed")
    private Boolean waiverSigned = false;

    @Column(name = "qr_code", unique = true)
    private String qrCode;

    @ManyToOne
    @JoinColumn(name = "promo_code_id")
    private PromoCode promoCode;

    @Column(name = "promo_discount_amount_snapshot", precision = 10, scale = 2)
    private BigDecimal promoDiscountAmountSnapshot;

    @Column(name = "tier_discount_percent_snapshot", precision = 5, scale = 2)
    private BigDecimal tierDiscountPercentSnapshot;

    @Column(name = "group_discount_percent_snapshot", precision = 5, scale = 2)
    private BigDecimal groupDiscountPercentSnapshot;

    @Column(name = "base_price_snapshot", precision = 10, scale = 2)
    private BigDecimal basePriceSnapshot;

    @Column(name = "dynamic_multiplier_snapshot", precision = 3, scale = 2)
    private BigDecimal dynamicMultiplierSnapshot;

    @Column(name = "cart_id")
    private UUID cartId;

    @Column(name = "cart_expires_at_utc")
    private Instant cartExpiresAtUtc;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc")
    private Instant updatedAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    public enum Status {
        PendingPayment, PendingGuide, Confirmed, InProgress, Completed, Cancelled, Waitlisted, Expired
    }

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