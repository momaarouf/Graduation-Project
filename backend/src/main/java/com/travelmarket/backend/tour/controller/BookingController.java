package com.travelmarket.backend.tour.controller;

import com.travelmarket.backend.tour.dto.request.CreateBookingRequest;
import com.travelmarket.backend.tour.dto.response.BookingResponse;
import com.travelmarket.backend.tour.dto.response.GuideBookingResponse;
import com.travelmarket.backend.tour.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── Traveler Endpoints ──────────────────────────────────────────────────

    @PostMapping("/traveler/bookings")
    public BookingResponse createBooking(@AuthenticationPrincipal UserDetails userDetails,
                                         @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(userDetails.getUsername(), request);
    }

    @GetMapping("/traveler/bookings")
    public List<BookingResponse> getTravelerBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return bookingService.getTravelerBookings(userDetails.getUsername());
    }

    @GetMapping("/traveler/bookings/{id}")
    public BookingResponse getTravelerBooking(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long id) {
        return bookingService.getTravelerBooking(userDetails.getUsername(), id);
    }

    @DeleteMapping("/traveler/bookings/{id}")
    public BookingResponse cancelBooking(@AuthenticationPrincipal UserDetails userDetails,
                                        @PathVariable Long id) {
        return bookingService.cancelBooking(userDetails.getUsername(), id);
    }

    // ── Guide Endpoints ─────────────────────────────────────────────────────

    @GetMapping("/guide/bookings")
    public List<GuideBookingResponse> getGuideBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return bookingService.getGuideBookings(userDetails.getUsername());
    }

    @GetMapping("/guide/bookings/{id}")
    public GuideBookingResponse getGuideBooking(@AuthenticationPrincipal UserDetails userDetails,
                                               @PathVariable Long id) {
        return bookingService.getGuideBooking(userDetails.getUsername(), id);
    }

    @PutMapping("/guide/bookings/{id}/confirm")
    public GuideBookingResponse confirmBooking(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long id) {
        return bookingService.confirmBooking(userDetails.getUsername(), id);
    }

    @PutMapping("/guide/bookings/{id}/reject")
    public GuideBookingResponse rejectBooking(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long id) {
        return bookingService.rejectBooking(userDetails.getUsername(), id);
    }
}
