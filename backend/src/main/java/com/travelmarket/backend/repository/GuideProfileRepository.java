package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.GuideProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GuideProfileRepository extends JpaRepository<GuideProfile, Long> {

    Optional<GuideProfile> findByUserId(Long userId);

    /**
     * Pending = submitted, not verified, not deleted, and NOT rejected.
     */
    @Query("""
        SELECT gp FROM GuideProfile gp
        WHERE gp.deletedAtUtc IS NULL
          AND gp.idVerified = false
          AND gp.verificationSubmittedAtUtc IS NOT NULL
          AND gp.verificationRejectedReason IS NULL
    """)
    List<GuideProfile> findPendingVerifications();

    /**
     * Rejected = submitted, not verified, not deleted, and rejected reason exists.
     */
    @Query("""
        SELECT gp FROM GuideProfile gp
        WHERE gp.deletedAtUtc IS NULL
          AND gp.idVerified = false
          AND gp.verificationSubmittedAtUtc IS NOT NULL
          AND gp.verificationRejectedReason IS NOT NULL
    """)
    List<GuideProfile> findRejectedVerifications();
    @Query("""
    SELECT gp FROM GuideProfile gp
    WHERE gp.deletedAtUtc IS NULL
      AND gp.idVerified = true
    ORDER BY gp.idVerifiedAtUtc DESC
""")
    List<GuideProfile> findVerifiedGuides();
}