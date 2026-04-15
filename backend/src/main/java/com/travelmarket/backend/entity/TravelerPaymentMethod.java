package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "traveler_payment_methods")
@Getter
@Setter
public class TravelerPaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_profile_id", nullable = false)
    private TravelerProfile travelerProfile;

    @Column(name = "brand", length = 30)
    private String brand; // Visa, Mastercard, AMEX

    @Column(name = "last4", length = 4)
    private String last4;

    @Column(name = "cardholder_name")
    private String cardholderName;

    @Column(name = "expiry_month")
    private Integer expiryMonth;

    @Column(name = "expiry_year")
    private Integer expiryYear;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    // ── Timestamps ─────────────────────────────────────────────────────────────

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    /**
     * Soft delete timestamp.
     *
     * Set by TravelerPaymentController when a traveler removes a card.
     * The physical row is NEVER deleted — the Stripe payment method ID on this
     * row may be referenced by historical Payment records for refunds and disputes.
     * All read queries must filter WHERE deleted_at_utc IS NULL.
     */
    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
    }
}
