package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.Booking;
import com.travelmarket.backend.entity.TravelerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTravelerAndStatusIn(TravelerProfile traveler, List<Booking.Status> statuses);
}