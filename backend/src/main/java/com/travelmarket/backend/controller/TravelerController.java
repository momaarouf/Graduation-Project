package com.travelmarket.backend.controller;

import com.travelmarket.backend.entity.Booking;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.BookingRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/traveler")
@RequiredArgsConstructor
public class TravelerController {

    private final UserRepository userRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final BookingRepository bookingRepository;

    // getProfile moved to TravelerProfileController

    @GetMapping("/bookings/upcoming")
    public List<Booking> getUpcomingBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        TravelerProfile traveler = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile not found"));

        // Define which statuses count as "upcoming"
        List<Booking.Status> upcomingStatuses = List.of(
                Booking.Status.PendingPayment,
                Booking.Status.PendingGuide,
                Booking.Status.Confirmed
        );

        return bookingRepository.findByTravelerAndStatusIn(traveler, upcomingStatuses);
    }
}