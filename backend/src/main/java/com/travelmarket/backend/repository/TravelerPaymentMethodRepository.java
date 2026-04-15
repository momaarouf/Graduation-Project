package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.TravelerPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelerPaymentMethodRepository extends JpaRepository<TravelerPaymentMethod, Long> {

    /**
     * List all active (non-deleted) payment methods for a traveler, newest first.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     * Used by TravelerPaymentController.getMyPaymentMethods() and the default-card
     * management logic that iterates existing cards.
     */
    @Query("""
        SELECT m FROM TravelerPaymentMethod m
        WHERE m.travelerProfile.id = :travelerProfileId
          AND m.deletedAtUtc IS NULL
        ORDER BY m.createdAtUtc DESC
    """)
    List<TravelerPaymentMethod> findByTravelerProfileId(@Param("travelerProfileId") Long travelerProfileId);

    /**
     * Count of active (non-deleted) payment methods for a traveler.
     *
     * Soft-delete filter: excludes rows where deleted_at_utc IS NOT NULL.
     * Used when checking whether to auto-set isDefault=true on the first card.
     * Without this filter, a traveler who deleted their only card and re-adds
     * one would NOT get the default flag set correctly.
     */
    @Query("""
        SELECT COUNT(m) FROM TravelerPaymentMethod m
        WHERE m.travelerProfile.id = :travelerProfileId
          AND m.deletedAtUtc IS NULL
    """)
    long countByTravelerProfileId(@Param("travelerProfileId") Long travelerProfileId);
}
