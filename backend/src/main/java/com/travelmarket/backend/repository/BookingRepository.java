package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.Booking;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTravelerAndStatusIn(TravelerProfile traveler, List<Booking.Status> statuses);

    List<Booking> findByTravelerOrderByCreatedAtUtcDesc(TravelerProfile traveler);

    @Query("SELECT b FROM Booking b WHERE b.occurrence.template.guide = :guide ORDER BY b.createdAtUtc DESC")
    List<Booking> findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(GuideProfile guide);

    Optional<Booking> findByIdAndOccurrenceTemplateGuideUserEmail(Long id, String email);

    Optional<Booking> findByIdAndTravelerUserEmail(Long id, String email);
}