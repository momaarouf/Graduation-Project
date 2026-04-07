package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "guide_profiles")
@Getter
@Setter
public class GuideProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "id_verified")
    private Boolean idVerified = false;

    @Column(name = "id_verified_at_utc")
    private Instant idVerifiedAtUtc;

    @Column(name = "whish_account")
    private String whishAccount;

    /**
     * Stripe Connect account ID for this guide (e.g. "acct_1ABC...").
     * Set when the guide completes Stripe Express onboarding (future milestone).
     * Used by PayoutReleaseJob to transfer earnings after the 48h freeze window.
     *
     * In test mode: create a test connected account in Stripe Dashboard →
     * Connected accounts, and paste the "acct_test_..." ID here via the
     * guide profile update endpoint or directly in the DB for demo purposes.
     *
     * NULL means guide has not set up payouts → PayoutStatus transitions to Failed.
     */
    @Column(name = "stripe_account_id")
    private String stripeAccountId;

    @Column(name = "payout_method_last4", length = 4)
    private String payoutMethodLast4;

    @Column(name = "payout_method_brand", length = 20)
    private String payoutMethodBrand;

    @Column(name = "payout_method_type", length = 20)
    private String payoutMethodType; // "card" or "bank"

    @Column(name = "impact_score", precision = 5, scale = 2)
    private BigDecimal impactScore = BigDecimal.ZERO;

    @Column(name = "current_fee_multiplier", precision = 3, scale = 2)
    private BigDecimal currentFeeMultiplier = BigDecimal.ONE;

    @Column(name = "total_guided_trips")
    private Integer totalGuidedTrips = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc")
    private Instant updatedAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    @Column(name = "base_country", length = 60)
    private String baseCountry;

    @Column(name = "base_city", length = 80)
    private String baseCity;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "expertise_json")
    private String expertiseJson;

    // ===== Verification documents (Lebanon-first, upgradeable) =====
    @Column(name = "id_document_type", length = 30)
    private String idDocumentType; // NATIONAL_ID or PASSPORT

    @Column(name = "id_front_image")
    private String idFrontImage;

    @Column(name = "id_back_image")
    private String idBackImage;

    @Column(name = "verification_submitted_at_utc")
    private Instant verificationSubmittedAtUtc;

    @Column(name = "verification_rejected_reason", length = 255)
    private String verificationRejectedReason;

    // ===== Backward compatibility with V1 columns =====
    @Column(name = "id_verification_image")
    private String idVerificationImage;

    @Column(name = "selfie_image")
    private String selfieImage;

    @Column(name = "tagline")
    private String tagline;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "tour_count")
    private Integer tourCount = 0;

    @Column(name = "social_links_json", columnDefinition = "TEXT")
    private String socialLinksJson;

    @Column(name = "response_rate", precision = 5, scale = 2)
    private BigDecimal responseRate;

    @Column(name = "response_time_text", length = 50)
    private String responseTimeText;

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