package com.travelmarket.backend.tour.repository;

import com.travelmarket.backend.tour.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    /**
     * All active, non-deleted pricing rules for a template.
     * Used by the future dynamic pricing service when calculating
     * the effective price for a given occurrence date.
     */
    @Query("""
        SELECT r FROM PricingRule r
        WHERE r.template.id = :templateId
          AND r.active = true
          AND r.deletedAtUtc IS NULL
        ORDER BY r.ruleType ASC
    """)
    List<PricingRule> findActiveByTemplateId(@Param("templateId") Long templateId);

    /**
     * All pricing rules for a template including inactive ones.
     * Used by guide management endpoints so the guide can see
     * and toggle their full rule set.
     */
    @Query("""
        SELECT r FROM PricingRule r
        WHERE r.template.id = :templateId
          AND r.deletedAtUtc IS NULL
        ORDER BY r.ruleType ASC
    """)
    List<PricingRule> findAllByTemplateId(@Param("templateId") Long templateId);
}