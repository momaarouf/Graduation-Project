package com.travelmarket.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Column(name = "full_name", nullable = true, length = 120)
    private String fullName;

    @Column(name = "phone_e164", nullable = true, unique = true, length = 20)
    private String phoneE164;

    @Column(name = "is_phone_verified", nullable = false)
    private Boolean isPhoneVerified = false;

    // Agreements & profile completion
    @Column(name = "profile_completed", nullable = false)
    private Boolean profileCompleted = false;

    @Column(name = "agreed_to_terms", nullable = false)
    private Boolean agreedToTerms = false;

    @Column(name = "agreed_to_privacy", nullable = false)
    private Boolean agreedToPrivacy = false;

    @Column(name = "newsletter_opt_in", nullable = false)
    private Boolean newsletterOptIn = false;

    @Column(name = "marketing_opt_in", nullable = false)
    private Boolean marketingOptIn = false;

    @Column(name = "agreements_accepted_at_utc")
    private Instant agreementsAcceptedAtUtc;

    // Account lifecycle
    @Column(name = "account_status", nullable = false, length = 20)
    private String accountStatus = "ACTIVE";

    @Column(name = "suspended_until_utc")
    private Instant suspendedUntilUtc;

    @Column(name = "status_reason", length = 255)
    private String statusReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    @Column(name = "preferred_language")
    private String preferredLanguage = "en";

    private String timezone = "UTC";

    @Column(name = "email_notifications_enabled", nullable = false)
    private Boolean emailNotificationsEnabled = true;

    @Column(name = "push_notifications_enabled", nullable = false)
    private Boolean pushNotificationsEnabled = true;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "created_at_utc", updatable = false)
    private Instant createdAtUtc;

    @Column(name = "updated_at_utc")
    private Instant updatedAtUtc;

    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    /**
     * Strong logout mechanism:
     * - Each access JWT includes claim "tv" (token version).
     * - On every request, we compare claim tv with users.token_version from DB.
     * - If mismatch -> token is considered revoked immediately (401).
     *
     * Increment this number when you want to revoke all currently issued access tokens.
     * Most common place to increment: /api/auth/logout-all.
     */
    @Column(name = "token_version", nullable = false)
    private Integer tokenVersion = 0;


    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
        updatedAtUtc = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAtUtc = Instant.now();
    }

    public enum Role {
        Traveler, Guide, Admin
    }
}