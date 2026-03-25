package com.travelmarket.backend.booking.controller;

import com.travelmarket.backend.booking.dto.request.*;
import com.travelmarket.backend.booking.dto.response.*;
import com.travelmarket.backend.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Booking lifecycle REST controller.
 *
 * URL prefix conventions must match the role matchers in SecurityConfig:
 *   /api/traveler/** → authenticated TRAVELER role only
 *   /api/guide/**    → authenticated GUIDE role only
 *
 * Ownership is always enforced inside BookingService — never trust the path
 * id alone. Every service call also passes the authenticated user's email so
 * the service scopes every query to their own data.
 *
 * Full endpoint list:
 *   POST   /api/traveler/bookings                         createBooking
 *   GET    /api/traveler/bookings                         getTravelerBookings
 *   GET    /api/traveler/bookings/{id}                    getTravelerBooking
 *   DELETE /api/traveler/bookings/{id}                    cancelBooking
 *   POST   /api/traveler/waitlist                         joinWaitlist
 *   GET    /api/traveler/waitlist                         getMyWaitlist
 *   DELETE /api/traveler/waitlist/{id}                    leaveWaitlist
 *   GET    /api/guide/bookings                            getGuideBookings
 *   GET    /api/guide/bookings/{id}                       getGuideBooking
 *   PUT    /api/guide/bookings/{id}/confirm               confirmBooking
 *   PUT    /api/guide/bookings/{id}/reject                rejectBooking
 *   POST   /api/guide/bookings/{id}/checkin               checkIn (dashboard tap)
 *   POST   /api/guide/bookings/checkin-by-qr/{qrToken}    checkInByQr (scanner flow)
 *   POST   /api/guide/bookings/{id}/complete              completeBooking
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── Traveler: Booking CRUD ─────────────────────────────────────────────────

    /**
     * Create a new booking for the authenticated traveler.
     *
     * Behavior depends on the occurrence's template.instantBook setting:
     *   true  → BookingMode.Instant → status: CONFIRMED (seat reserved immediately)
     *   false → BookingMode.Request → status: PENDING_GUIDE (awaiting guide acceptance)
     *
     * Returns HTTP 409 if the occurrence is full — client should redirect to waitlist.
     */
    @PostMapping("/traveler/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(user.getUsername(), request);
    }

    /**
     * List all bookings for the authenticated traveler, newest first.
     * Includes all statuses (active, completed, cancelled) for full history.
     */
    @GetMapping("/traveler/bookings")
    public List<BookingResponse> getTravelerBookings(
            @AuthenticationPrincipal UserDetails user) {
        return bookingService.getTravelerBookings(user.getUsername());
    }

    /**
     * Get a single booking owned by the authenticated traveler.
     * Includes the qrCode field for generating the traveler's check-in QR display.
     * Returns HTTP 404 if the booking doesn't exist or belongs to another traveler.
     */
    @GetMapping("/traveler/bookings/{id}")
    public BookingResponse getTravelerBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return bookingService.getTravelerBooking(user.getUsername(), id);
    }

    /**
     * Cancel a booking owned by the authenticated traveler.
     *
     * Request body is optional: { "reason": "Plans changed" }
     * If omitted, defaults to "Cancelled by Traveler".
     *
     * Refund percentage computed and snapshotted based on the time window:
     *   > 48 h  → 100%  (minus platform fee — deducted in payment card)
     *   24–48 h → 50%
     *   < 24 h  → 0%
     *
     * If the booking held seats (CONFIRMED / IN_PROGRESS), they are released
     * and the first waitlisted traveler is automatically promoted.
     */
    @DeleteMapping("/traveler/bookings/{id}")
    public BookingResponse cancelBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request) {
        return bookingService.cancelBooking(user.getUsername(), id, request);
    }

    // ── Traveler: Waitlist ─────────────────────────────────────────────────────

    /**
     * Join the waitlist for a full occurrence.
     * Returns HTTP 400 if the occurrence is not actually full.
     * Returns HTTP 409 if already on this waitlist or has an active booking.
     */
    @PostMapping("/traveler/waitlist")
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistResponse joinWaitlist(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody JoinWaitlistRequest request) {
        return bookingService.joinWaitlist(user.getUsername(), request);
    }

    /**
     * List all active waitlist entries for the authenticated traveler, newest first.
     * Promoted or self-removed (soft-deleted) entries are excluded.
     */
    @GetMapping("/traveler/waitlist")
    public List<WaitlistResponse> getMyWaitlist(
            @AuthenticationPrincipal UserDetails user) {
        return bookingService.getMyWaitlist(user.getUsername());
    }

    /**
     * Leave (soft-delete) a waitlist entry owned by the authenticated traveler.
     * Decrements the occurrence's waitlist counter.
     * Returns HTTP 404 if the entry doesn't exist or belongs to another traveler.
     */
    @DeleteMapping("/traveler/waitlist/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveWaitlist(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        bookingService.leaveWaitlist(user.getUsername(), id);
    }

    // ── Guide: Read ────────────────────────────────────────────────────────────

    /**
     * List all bookings across all of the guide's own tour occurrences, newest first.
     * Only bookings on the authenticated guide's own templates are returned.
     */
    @GetMapping("/guide/bookings")
    public List<GuideBookingResponse> getGuideBookings(
            @AuthenticationPrincipal UserDetails user) {
        return bookingService.getGuideBookings(user.getUsername());
    }

    /**
     * Get a single booking on one of the guide's own occurrences.
     * Returns HTTP 404 if the booking doesn't exist or belongs to another guide's tour.
     * Note: qrCode is intentionally excluded from guide responses.
     */
    @GetMapping("/guide/bookings/{id}")
    public GuideBookingResponse getGuideBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return bookingService.getGuideBooking(user.getUsername(), id);
    }

    // ── Guide: Accept / Reject Request Bookings ────────────────────────────────

    /**
     * Accept a PENDING_GUIDE booking → CONFIRMED.
     * Re-validates capacity in case instant bookings filled seats in the meantime.
     * Returns HTTP 409 if the occurrence is now full.
     */
    @PutMapping("/guide/bookings/{id}/confirm")
    public GuideBookingResponse confirmBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return bookingService.confirmBooking(user.getUsername(), id);
    }

    /**
     * Reject a PENDING_GUIDE booking → CANCELLED.
     * Request body optional: { "reason": "Date conflict with private group" }
     * If omitted, defaults to "Rejected by Guide".
     * No seat adjustment — PENDING_GUIDE bookings never hold reserved seats.
     */
    @PutMapping("/guide/bookings/{id}/reject")
    public GuideBookingResponse rejectBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestBody(required = false) RejectBookingRequest request) {
        return bookingService.rejectBooking(user.getUsername(), id, request);
    }

    // ── Guide: QR Check-in & Completion ───────────────────────────────────────

    /**
     * Check-in via booking database id.
     * Used when the guide taps a booking directly from their dashboard list.
     * Transitions: CONFIRMED → IN_PROGRESS.
     */
    @PostMapping("/guide/bookings/{id}/checkin")
    public GuideBookingResponse checkIn(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return bookingService.checkIn(user.getUsername(), id);
    }

    /**
     * Check-in via the UUID QR token scanned from the traveler's QR code.
     * This is the primary scanner flow used in the field:
     *   1. Traveler's app displays a QR encoding their booking's qrCode UUID.
     *   2. Guide's scanner reads the token and calls this endpoint.
     *   3. Server validates the token belongs to one of this guide's own
     *      occurrences — cross-guide check-in is impossible by design.
     * Transitions: CONFIRMED → IN_PROGRESS.
     */
    @PostMapping("/guide/bookings/checkin-by-qr/{qrToken}")
    public GuideBookingResponse checkInByQr(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable String qrToken) {
        return bookingService.checkInByQrToken(user.getUsername(), qrToken);
    }

    /**
     * Mark this booking as fully completed.
     * Transitions: IN_PROGRESS → COMPLETED.
     * Sets completedAtUtc — starts the 48 h payout freeze (future payout card).
     * Also unlocks review eligibility for the traveler (future review card).
     */
    @PostMapping("/guide/bookings/{id}/complete")
    public GuideBookingResponse completeBooking(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return bookingService.completeBooking(user.getUsername(), id);
    }
}