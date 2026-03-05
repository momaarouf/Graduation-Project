package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "promo_codes")
@Getter
@Setter
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "guide_id")
    private GuideProfile guide;          // nullable – if null, it's a platform-wide promo

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "guide_funded")
    private Boolean guideFunded = false; // true = discount taken from guide's payout

    @Column(name = "max_uses")
    private Integer maxUses;              // maximum number of times this code can be used

    @Column(name = "used_count")
    private Integer usedCount = 0;        // how many times used so far

    @Column(name = "expires_at_utc")
    private Instant expiresAtUtc;          // when the code becomes invalid (null = never)

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    // Bidirectional mapping to bookings (optional, but helpful for queries)
    @OneToMany(mappedBy = "promoCode")
    private List<Booking> bookings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
    }
}