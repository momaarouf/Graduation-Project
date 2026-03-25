package com.travelmarket.backend.controller;

import com.travelmarket.backend.booking.dto.response.BookingResponse;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Legacy traveler controller — kept for the /bookings/upcoming endpoint.
 *
 * The main booking CRUD lives in booking/controller/BookingController.
 * This controller holds the upcoming-bookings convenience query which
 * filters by active statuses and was originally written against the old
 * Booking.Status inner enum (now removed).
 *
 * Fixed: replaced Booking.Status.* references with BookingStatus.*
 * Fixed: replaced the removed findByTravelerAndStatusIn() with a stream
 *        filter on findByTravelerOrderByCreatedAtUtcDesc() which is
 *        already present in BookingRepository.
 */
@RestController
@RequestMapping("/api/traveler")
@RequiredArgsConstructor
public class TravelerController {

    private final UserRepository userRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final BookingRepository bookingRepository;

    /**
     * Returns the authenticated traveler's upcoming bookings —
     * those in an active, non-terminal status.
     *
     * Statuses that count as "upcoming":
     *   PendingPayment – awaiting payment capture (future payment card)
     *   PendingGuide   – awaiting guide acceptance
     *   Confirmed      – confirmed, tour not yet started
     */
    @GetMapping("/bookings/upcoming")
    public List<Booking> getUpcomingBookings(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelerProfile traveler = travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile not found"));

        // Active statuses that represent an upcoming / in-flight booking
        List<BookingStatus> upcomingStatuses = List.of(
                BookingStatus.PendingPayment,
                BookingStatus.PendingGuide,
                BookingStatus.Confirmed
        );

        // Use the existing repository method and filter in memory.
        // findByTravelerAndStatusIn was removed from BookingRepository when
        // the module was restructured; this approach avoids adding a duplicate
        // query method and keeps the repository lean.
        return bookingRepository
                .findByTravelerOrderByCreatedAtUtcDesc(traveler)
                .stream()
                .filter(b -> upcomingStatuses.contains(b.getStatus()))
                .collect(Collectors.toList());
    }
}