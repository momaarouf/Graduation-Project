package com.travelmarket.backend.entity;

import com.travelmarket.backend.booking.entity.Booking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A promotional discount code that can be applied to bookings.
 *
 * Scope:
 *   guide IS NULL  → platform-wide promo (issued by admin)
 *   guide NOT NULL → guide-specific promo (issued by a guide for their own tours)
 *
 * guideFunded = true means the discount is taken from the guide's payout,
 * not the platform's margin. Logic lives in the payment card.
 *
 * maxUses / usedCount: basic usage cap. Incremented atomically in BookingService
 * when a promo is applied. Full idempotency enforcement lives in the payment card.
 */
@Entity
@Table(name = "promo_codes")
@Getter
@Setter
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = platform-wide promo; non-null = guide-specific promo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_id")
    private GuideProfile guide;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent;

    // true = discount comes from guide's payout, not platform margin
    @Column(name = "guide_funded")
    private Boolean guideFunded = false;

    // Maximum number of times this code can be used across all travelers
    @Column(name = "max_uses")
    private Integer maxUses;

    // Incremented each time the code is successfully applied to a booking
    @Column(name = "used_count")
    private Integer usedCount = 0;

    // null = never expires
    @Column(name = "expires_at_utc")
    private Instant expiresAtUtc;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    // Bidirectional reference — useful for admin queries on promo usage
    @OneToMany(mappedBy = "promoCode")
    private List<Booking> bookings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
    }
}