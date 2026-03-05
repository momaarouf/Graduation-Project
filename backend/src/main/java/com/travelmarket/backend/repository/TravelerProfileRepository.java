package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.TravelerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TravelerProfileRepository extends JpaRepository<TravelerProfile, Long> {
    Optional<TravelerProfile> findByUserId(Long userId);

    // Custom query to find profile by user email (join with User entity)
    @Query("SELECT tp FROM TravelerProfile tp JOIN tp.user u WHERE u.email = :email")
    Optional<TravelerProfile> findByUserEmail(@Param("email") String email);
}