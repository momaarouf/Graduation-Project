package com.travelmarket.backend.tour.entity;

import com.travelmarket.backend.tour.enums.PricingRuleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Represents a dynamic pricing rule attached to a TourTemplate.
 *
 * A rule defines a multiplier applied to base_price under a given condition
 * (weekend, holiday, or rush day). Multiple rules can exist per template;
 * the service layer resolves which rule applies for a given booking date.
 *
 * Full dynamic pricing logic is out of scope for the current card.
 * This entity is created now for forward compatibility so that future
 * pricing features require no schema or entity changes.
 *
 * Soft delete: set deleted_at_utc; never hard-delete pricing rules
 * (audit trail for pricing history matters for dispute resolution later).
 */
@Entity
@Table(name = "pricing_rules")
@Getter
@Setter
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The tour this rule applies to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TourTemplate template;

    // Condition that triggers this rule (WEEKEND, HOLIDAY, RUSH_DAY)
    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", length = 50)
    private PricingRuleType ruleType;

    // Price multiplier applied to base_price when rule is triggered
    // e.g. 1.20 = 20% surge, 0.90 = 10% off
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal multiplier;

    // Whether this rule is currently in effect
    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at_utc", nullable = false, updatable = false)
    private Instant createdAtUtc;

    // Soft delete — retain for pricing audit trail
    @Column(name = "deleted_at_utc")
    private Instant deletedAtUtc;

    @PrePersist
    protected void onCreate() {
        createdAtUtc = Instant.now();
    }
}