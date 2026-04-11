package com.travelmarket.backend.booking.service;

import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;import com.travelmarket.backend.booking.dto.request.*;
import com.travelmarket.backend.booking.dto.response.*;
import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.entity.WaitlistEntry;
import com.travelmarket.backend.booking.enums.BookingMode;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.booking.repository.WaitlistRepository;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.payment.service.StripePaymentService;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;
    private final TourOccurrenceRepository occurrenceRepository;
    private final TravelerProfileRepository travelerRepository;
    private final GuideProfileRepository guideRepository;
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;
    @Lazy
    private final StripePaymentService stripePaymentService;

    // ── Traveler: Create Booking ──────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        TravelerProfile traveler = resolveTraveler(email);
        validateTravelerEligibility(traveler);
        
        TourOccurrence occurrence = resolveOccurrence(request.getOccurrenceId());

        validateOccurrenceBookable(occurrence);

        // Prevent a traveler from booking the same occurrence twice
        bookingRepository.findActiveBookingForOccurrence(
                traveler, occurrence,
                List.of(BookingStatus.Cancelled, BookingStatus.Expired)
        ).ifPresent(b -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have an active booking for this tour");
        });

        int newTotalSeats = occurrence.getSeatsReserved() + request.getPeopleCount();
        int maxCapacity = occurrence.getTemplate().getMaxCapacity();

        // If at capacity, the client should redirect the traveler to the waitlist endpoint
        if (newTotalSeats > maxCapacity) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "This tour is full. Join the waitlist instead.");
        }

        Booking booking = new Booking();
        booking.setTraveler(traveler);
        booking.setOccurrence(occurrence);
        booking.setPeopleCount(request.getPeopleCount());
        booking.setWaiverSigned(Boolean.TRUE.equals(request.getWaiverSigned()));

        // Snapshot all pricing at booking time so future template edits don't
        // alter historical booking records
        BigDecimal basePrice = occurrence.getTemplate().getBasePrice();
        booking.setBasePriceSnapshot(basePrice);
        booking.setCurrency(occurrence.getTemplate().getCurrency() != null
                ? occurrence.getTemplate().getCurrency() : "USD");

        // Snapshot platform fee (default 10% for now — feeds cancellation refund calc)
        calculateAndSetFinalPrice(booking, occurrence.getTemplate());
        booking.setPlatformFeeSnapshot(booking.getFinalPrice().multiply(new BigDecimal("0.10")));

        // Resolve booking mode from the template and snapshot it onto the booking.
        // A guide flipping instantBook later won't affect bookings already in flight.
        boolean isInstant = Boolean.TRUE.equals(occurrence.getTemplate().getInstantBook());
        booking.setBookingMode(isInstant ? BookingMode.Instant : BookingMode.Request);

        if (isInstant) {
            // Instant Book: seats tentatively reserved for 30 minutes while traveler pays.
            // Booking stays in PendingPayment until StripePaymentService confirms payment.
            // On success (webhook/mock-confirm): → Confirmed
            // On expiry (no payment in 30 min): → Expired, seats released by cleanup job
            booking.setStatus(BookingStatus.PendingPayment);
            reserveSeats(occurrence, newTotalSeats - occurrence.getSeatsReserved());
        } else {
            // Request to Book: seat is ALSO reserved immediately to prevent overbooking
            // while the guide reviews. Guide has 24 h to respond.
            // Phase 2: after guide accepts → PendingPayment → payment → Confirmed
            // Phase 1: guide accepts → Confirmed directly (payment skipped for Request mode)
            booking.setStatus(BookingStatus.PendingGuide);
            reserveSeats(occurrence, newTotalSeats - occurrence.getSeatsReserved());
        }

        // Generate the check-in QR token. Encoded in the traveler's QR code display.
        // The guide's scanner sends this token to /guide/bookings/checkin-by-qr/{token}
        // where it is validated against the guide's own occurrences server-side.
        booking.setQrCode(UUID.randomUUID().toString());

        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
                occurrence.getTemplate().getGuide().getUser().getId(),
                NotificationType.BOOKING_CREATED,
                "New Booking " + (isInstant ? "Confirmed" : "Request"),
                "You have a new booking " + (isInstant ? "confirmed" : "request") + " from " + traveler.getUser().getFullName(),
                saved.getId().toString(),
                "BOOKING"
        );
        
        return mapToResponse(saved);
    }

    // ── Traveler: Read ────────────────────────────────────────────────────────

    // @Transactional(readOnly = true) is required on all read methods.
    // Without it, Hibernate closes the session before mapToResponse() accesses
    // lazy associations like occurrence.template.title and traveler.user.fullName,
    // causing LazyInitializationException at runtime.

    @Transactional
    public List<BookingResponse> getTravelerBookings(String email) {
        TravelerProfile traveler = resolveTraveler(email);
        List<Booking> bookings = bookingRepository.findByTravelerOrderByCreatedAtUtcDesc(traveler);
        syncBookingStatuses(bookings);
        return bookings.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse getTravelerBooking(String email, Long id) {
        Booking booking = resolveTravelerBooking(id, email);
        syncBookingStatuses(List.of(booking));
        return mapToResponse(booking);
    }

    // ── Traveler: Cancel ──────────────────────────────────────────────────────

    @Transactional
    public BookingResponse cancelBooking(String email, Long id, CancelBookingRequest request) {
        Booking booking = resolveTravelerBooking(id, email);

        // Terminal states — cannot be cancelled
        if (booking.getStatus() == BookingStatus.Completed
                || booking.getStatus() == BookingStatus.Cancelled
                || booking.getStatus() == BookingStatus.Expired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This booking cannot be cancelled in its current state");
        }

        Instant now = Instant.now();
        Instant startTime = booking.getOccurrence().getStartTimeUtc();
        long hoursUntilStart = Duration.between(now, startTime).toHours();

        // Cancellation refund policy:
        //   > 48 h before start  → 100% refund (platform fee deducted in payment card)
        //   24–48 h before start → 50% refund
        //   < 24 h before start  → 0% refund (no refund)
        //
        // Snapshotted here so the payment card can compute the exact refund amount
        // without re-evaluating the time window retroactively.
        if (hoursUntilStart > 48) {
            booking.setRefundPercent(BigDecimal.valueOf(100));
        } else if (hoursUntilStart >= 24) {
            booking.setRefundPercent(BigDecimal.valueOf(50));
        } else {
            booking.setRefundPercent(BigDecimal.ZERO);
        }

        // Release reserved seats for all states that hold them:
        // PendingPayment = tentatively reserved (30-min cart lock)
        // PendingGuide   = held while guide reviews
        // Confirmed      = confirmed seat
        // InProgress     = tour underway
        if (booking.getStatus() == BookingStatus.PendingPayment
                || booking.getStatus() == BookingStatus.Confirmed
                || booking.getStatus() == BookingStatus.PendingGuide
                || booking.getStatus() == BookingStatus.InProgress) {

            releaseSeats(booking.getOccurrence(), booking.getPeopleCount());
            promoteFromWaitlist(booking.getOccurrence());
        }

        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(now);
        booking.setCancellationReason(
                request != null && request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "Cancelled by Traveler");

        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
                booking.getOccurrence().getTemplate().getGuide().getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Cancelled",
                booking.getTraveler().getUser().getFullName() + " has cancelled their booking for " + booking.getOccurrence().getTemplate().getTitle() + ".",
                saved.getId().toString(),
                "BOOKING"
        );
        
        return mapToResponse(saved);
    }

    // ── Traveler: Update Booking ──────────────────────────────────────────────

    @Transactional
    public BookingResponse updateBooking(String email, Long id, UpdateBookingRequest request) {
        Booking booking = resolveTravelerBooking(id, email);

        if (booking.getStatus() == BookingStatus.Completed
                || booking.getStatus() == BookingStatus.Cancelled
                || booking.getStatus() == BookingStatus.Expired) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This booking cannot be edited in its current state");
        }

        TourOccurrence oldOccurrence = booking.getOccurrence();
        TourOccurrence newOccurrence = resolveOccurrence(request.getOccurrenceId());

        int oldPeopleCount = booking.getPeopleCount();
        int newPeopleCount = request.getPeopleCount();

        boolean occurrenceChanged = !oldOccurrence.getId().equals(newOccurrence.getId());
        boolean peopleCountChanged = oldPeopleCount != newPeopleCount;

        if (!occurrenceChanged && !peopleCountChanged) {
            return mapToResponse(booking);
        }

        if (occurrenceChanged) {
            // Must be the same tour template
            if (!newOccurrence.getTemplate().getId().equals(oldOccurrence.getTemplate().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot switch to a different tour");
            }

            // Release seats in old occurrence if they were reserved
            if (booking.getStatus() == BookingStatus.Confirmed 
                || booking.getStatus() == BookingStatus.PendingGuide
                || booking.getStatus() == BookingStatus.InProgress) {
                releaseSeats(oldOccurrence, oldPeopleCount);
                promoteFromWaitlist(oldOccurrence);
            }

            // Try reserving in new occurrence
            int available = newOccurrence.getCapacity() - newOccurrence.getSeatsReserved();
            if (newPeopleCount <= available) {
                booking.setOccurrence(newOccurrence);
                booking.setPeopleCount(newPeopleCount);
                if (booking.getStatus() == BookingStatus.Confirmed 
                    || booking.getStatus() == BookingStatus.PendingGuide
                    || booking.getStatus() == BookingStatus.InProgress) {
                    reserveSeats(newOccurrence, newPeopleCount);
                }
            } else {
                if (Boolean.TRUE.equals(request.getConfirmWaitlistTransition())) {
                    booking.setOccurrence(newOccurrence);
                    booking.setPeopleCount(newPeopleCount);
                    moveToWaitlist(booking);
                    return mapToResponse(booking); // Will show as Cancelled in history
                } else {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Not enough spots on the new date. Move to waitlist?");
                }
            }
        } else {
            // peopleCountChanged only
            int diff = newPeopleCount - oldPeopleCount;
            if (diff < 0) {
                // Releasing seats
                if (booking.getStatus() == BookingStatus.Confirmed 
                    || booking.getStatus() == BookingStatus.PendingGuide
                    || booking.getStatus() == BookingStatus.InProgress) {
                    releaseSeats(oldOccurrence, Math.abs(diff));
                    promoteFromWaitlist(oldOccurrence);
                }
                booking.setPeopleCount(newPeopleCount);
            } else {
                // Increasing seats
                int available = oldOccurrence.getCapacity() - oldOccurrence.getSeatsReserved();
                if (diff <= available) {
                    if (booking.getStatus() == BookingStatus.Confirmed 
                        || booking.getStatus() == BookingStatus.PendingGuide
                        || booking.getStatus() == BookingStatus.InProgress) {
                        reserveSeats(oldOccurrence, diff);
                    }
                    booking.setPeopleCount(newPeopleCount);
                } else {
                    if (Boolean.TRUE.equals(request.getConfirmWaitlistTransition())) {
                        booking.setPeopleCount(newPeopleCount);
                        moveToWaitlist(booking);
                        return mapToResponse(booking);
                    } else {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Not enough spots to add more people. Move to waitlist?");
                    }
                }
            }
        }

        // Snapshot new pricing
        calculateAndSetFinalPrice(booking, newOccurrence.getTemplate());
        booking.setPlatformFeeSnapshot(booking.getFinalPrice().multiply(new BigDecimal("0.10")));

        return mapToResponse(bookingRepository.save(booking));
    }

    private void reserveSeats(TourOccurrence occurrence, int count) {
        int newTotal = getSeatsReservedSafe(occurrence) + count;
        int capacity = getEffectiveCapacity(occurrence);
        
        occurrence.setSeatsReserved(newTotal);
        occurrence.setAvailableSeats(Math.max(0, capacity - newTotal));
        
        if (newTotal >= capacity) {
            occurrence.setStatus(TourOccurrenceStatus.FULL);
        }
        occurrenceRepository.save(occurrence);
    }

    private void releaseSeats(TourOccurrence occurrence, int count) {
        int newTotal = Math.max(0, getSeatsReservedSafe(occurrence) - count);
        int capacity = getEffectiveCapacity(occurrence);
        
        occurrence.setSeatsReserved(newTotal);
        occurrence.setAvailableSeats(Math.max(0, capacity - newTotal));
        
        if (occurrence.getStatus() == TourOccurrenceStatus.FULL) {
            occurrence.setStatus(TourOccurrenceStatus.SCHEDULED);
        }
        occurrenceRepository.save(occurrence);
    }

    private int getEffectiveCapacity(TourOccurrence occurrence) {
        if (occurrence.getCapacity() != null) return occurrence.getCapacity();
        return occurrence.getTemplate().getMaxCapacity();
    }

    private int getSeatsReservedSafe(TourOccurrence occurrence) {
        return occurrence.getSeatsReserved() != null ? occurrence.getSeatsReserved() : 0;
    }

    private int getWaitlistCountSafe(TourOccurrence occurrence) {
        return occurrence.getWaitlistCount() != null ? occurrence.getWaitlistCount() : 0;
    }

    private void moveToWaitlist(Booking booking) {
        // 1. Release seats if they were reserved!
        if (booking.getStatus() == BookingStatus.Confirmed 
                || booking.getStatus() == BookingStatus.PendingGuide
                || booking.getStatus() == BookingStatus.InProgress) {
            releaseSeats(booking.getOccurrence(), booking.getPeopleCount());
            promoteFromWaitlist(booking.getOccurrence());
        }

        // 2. Cancel the current booking
        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(Instant.now());
        booking.setCancellationReason("Moved to waitlist during edit");
        bookingRepository.save(booking);

        // 2. Create waitlist entry
        TourOccurrence occurrence = booking.getOccurrence();
        Integer maxPos = waitlistRepository.findMaxPositionForOccurrence(occurrence);
        int nextPosition = (maxPos == null ? 0 : maxPos) + 1;

        WaitlistEntry entry = new WaitlistEntry();
        entry.setOccurrence(occurrence);
        entry.setTraveler(booking.getTraveler());
        entry.setPosition(nextPosition);
        entry.setPeopleCount(booking.getPeopleCount());
        waitlistRepository.save(entry);

        // 3. Update occurrence counter
        occurrence.setWaitlistCount(getWaitlistCountSafe(occurrence) + booking.getPeopleCount());
        occurrenceRepository.save(occurrence);
    }

    // ── Guide: Read ───────────────────────────────────────────────────────────

    @Transactional
    public List<GuideBookingResponse> getGuideBookings(String email) {
        GuideProfile guide = resolveGuide(email);
        List<Booking> bookings = bookingRepository.findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(guide);
        syncBookingStatuses(bookings);
        return bookings.stream().map(this::mapToGuideResponse).collect(Collectors.toList());
    }

    @Transactional
    public GuideBookingResponse getGuideBooking(String email, Long id) {
        Booking booking = resolveGuideBooking(id, email);
        syncBookingStatuses(List.of(booking));
        return mapToGuideResponse(booking);
    }

    // ── Guide: Accept / Reject Request Bookings ───────────────────────────────

    @Transactional
    public GuideBookingResponse confirmBooking(String email, Long id) {
        Booking booking = resolveGuideBooking(id, email);
        TourOccurrence occurrence = booking.getOccurrence();

        if (booking.getStatus() != BookingStatus.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is not pending guide confirmation");
        }

        // Seats are already reserved since the Request phase — we just transition the status.
        // We still check if a race condition happened, though reserving during Request makes this rare.
        if (occurrence.getSeatsReserved() > occurrence.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot confirm: occurrence is now over capacity");
        }
        
        booking.setStatus(BookingStatus.Confirmed);
        occurrenceRepository.save(occurrence);

        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
                saved.getTraveler().getUser().getId(),
                NotificationType.BOOKING_CONFIRMED,
                "Booking Confirmed",
                "Your booking for " + occurrence.getTemplate().getTitle() + " has been confirmed by the guide.",
                saved.getId().toString(),
                "BOOKING"
        );

        return mapToGuideResponse(saved);
    }

    @Transactional
    public GuideBookingResponse rejectBooking(String email, Long id, RejectBookingRequest request) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is not pending guide confirmation");
        }

        // Release the seats that were held during the PENDING_GUIDE phase
        releaseSeats(booking.getOccurrence(), booking.getPeopleCount());
        promoteFromWaitlist(booking.getOccurrence());
        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(Instant.now());
        booking.setCancellationReason(
                request != null && request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "Rejected by Guide");

        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
                saved.getTraveler().getUser().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking Rejected",
                "Your booking request for " + booking.getOccurrence().getTemplate().getTitle() + " was not accepted by the guide.",
                saved.getId().toString(),
                "BOOKING"
        );

        return mapToGuideResponse(saved);
    }

    // ── Guide: QR Check-in & Completion ──────────────────────────────────────


    /**
     * Check-in via the UUID QR token scanned from the traveler's QR code.
     * This is the primary scanner flow:
     *   1. Traveler's app displays a QR code encoding their booking's qrCode UUID.
     *   2. Guide's scanner app reads the raw token and calls
     *      POST /api/guide/bookings/checkin-by-qr/{qrToken}.
     *   3. We look up the booking by token AND guide email so a guide can only
     *      check in travelers on their own occurrences — cross-guide access
     *      is impossible by design.
     */
    @Transactional
    public GuideBookingResponse checkInByQrToken(String guideEmail, String qrToken) {
        Booking booking = bookingRepository
                .findByQrCodeAndOccurrenceTemplateGuideUserEmail(qrToken, guideEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No valid booking found for this QR code"));

        if (booking.getStatus() == BookingStatus.InProgress || booking.getStatus() == BookingStatus.Completed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Traveler is already checked in");
        }

        if (booking.getStatus() != BookingStatus.Confirmed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking must be Confirmed before check-in (current: " + booking.getStatus() + ")");
        }

        validateCheckInTime(booking);

        booking.setStatus(BookingStatus.InProgress);
        booking.setCheckedInAtUtc(Instant.now());

        return mapToGuideResponse(bookingRepository.save(booking));
    }

    @Transactional
    public GuideBookingResponse completeBooking(String email, Long id) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.InProgress) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking must be IN_PROGRESS before it can be completed");
        }

        // IN_PROGRESS → COMPLETED.
        // completedAtUtc anchors the payout freeze window.
        // COMPLETED status also unlocks review eligibility.
        booking.setStatus(BookingStatus.Completed);
        booking.setCompletedAtUtc(Instant.now());

        // Increment traveler's total completed trips
        TravelerProfile traveler = booking.getTraveler();
        traveler.setTotalCompletedTrips((traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
        travelerRepository.save(traveler);

        Booking completedBooking = bookingRepository.save(booking);

        // Schedule guide payout: funds released after freeze window (0h demo / 48h production)
        stripePaymentService.scheduleGuidePayoutFor(completedBooking);

        return mapToGuideResponse(completedBooking);
    }

    /**
     * Mark a CONFIRMED booking as a No-Show.
     * Transitions: CONFIRMED → CANCELLED.
     * Releases seats and promotes waitlist.
     * refundPercent is set to 0.
     */
    @Transactional
    public GuideBookingResponse noShowBooking(String email, Long id, RejectBookingRequest request) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.Confirmed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only CONFIRMED bookings can be marked as No-Show");
        }

        validateNoShowTime(booking);

        // Release seats since this was a confirmed booking
        releaseSeats(booking.getOccurrence(), booking.getPeopleCount());
        // Offer the freed seat to the next traveler in the waitlist queue
        promoteFromWaitlist(booking.getOccurrence());

        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(Instant.now());
        booking.setCancellationReason(
                request != null && request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "Traveler No-Show");

        // Policy: No-Show = 0% refund (since it's < 24h)
        booking.setRefundPercent(BigDecimal.ZERO);

        return mapToGuideResponse(bookingRepository.save(booking));
    }

    // ── Waitlist ──────────────────────────────────────────────────────────────

    @Transactional
    public WaitlistResponse joinWaitlist(String email, JoinWaitlistRequest request) {
        TravelerProfile traveler = resolveTraveler(email);
        validateTravelerEligibility(traveler);

        TourOccurrence occurrence = resolveOccurrence(request.getOccurrenceId());
        int maxCapacity = occurrence.getTemplate().getMaxCapacity();
        int availableSeats = maxCapacity - occurrence.getSeatsReserved();

        // Waitlist only makes sense if the user's group CANNOT fit in the remaining spots.
        // If their group size (e.g., 2) is less than or equal to available (e.g., 3), 
        // they should book directly.
        if (request.getPeopleCount() <= availableSeats) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "There are still " + availableSeats + " seats available — you can book directly");
        }

        // Prevent duplicate active waitlist entries for the same traveler + occurrence
        waitlistRepository.findByOccurrenceAndTravelerAndDeletedAtUtcIsNull(occurrence, traveler)
                .ifPresent(w -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "You are already on the waitlist for this tour");
                });

        // Prevent joining the waitlist if already holding an active booking
        bookingRepository.findActiveBookingForOccurrence(
                traveler, occurrence,
                List.of(BookingStatus.Cancelled, BookingStatus.Expired)
        ).ifPresent(b -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "You already have an active booking for this tour");
        });

        // Assign the next position deterministically.
        Integer maxPos = waitlistRepository.findMaxPositionForOccurrence(occurrence);
        int nextPosition = (maxPos == null ? 0 : maxPos) + 1;

        WaitlistEntry entry = new WaitlistEntry();
        entry.setOccurrence(occurrence);
        entry.setTraveler(traveler);
        entry.setPosition(nextPosition);
        entry.setPeopleCount(request.getPeopleCount());

        // Increment the denormalized waitlist counter on the occurrence
        occurrence.setWaitlistCount(
                (occurrence.getWaitlistCount() != null ? occurrence.getWaitlistCount() : 0) + request.getPeopleCount());
        occurrenceRepository.save(occurrence);

        return mapToWaitlistResponse(waitlistRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<WaitlistResponse> getMyWaitlist(String email) {
        TravelerProfile traveler = resolveTraveler(email);
        return waitlistRepository
                .findByTravelerAndDeletedAtUtcIsNullOrderByCreatedAtUtcDesc(traveler)
                .stream().map(this::mapToWaitlistResponse).collect(Collectors.toList());
    }

    @Transactional
    public void leaveWaitlist(String email, Long waitlistId) {
        TravelerProfile traveler = resolveTraveler(email);
        WaitlistEntry entry = waitlistRepository
                .findByIdAndTravelerAndDeletedAtUtcIsNull(waitlistId, traveler)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Waitlist entry not found"));

        // Soft-delete the entry and decrement the occurrence counter
        entry.setDeletedAtUtc(Instant.now());
        waitlistRepository.save(entry);

        TourOccurrence occurrence = entry.getOccurrence();
        occurrence.setWaitlistCount(
                Math.max(0, (occurrence.getWaitlistCount() != null
                        ? occurrence.getWaitlistCount() : entry.getPeopleCount()) - entry.getPeopleCount()));
        occurrenceRepository.save(occurrence);
    }

    // ── Internal: Waitlist Promotion ──────────────────────────────────────────

    /**
     * Called after a confirmed booking is cancelled to offer freed seats
     * to travelers in the waitlist queue.
     *
     * Enhanced behavior:
     *   1. Loops through waitlisted travelers in position ASC order.
     *   2. Promotes a traveler ONLY if their requested group size fits in the freed capacity.
     *   3. Continues to the next traveler if the current one is too large for the remaining gap.
     *   4. Stops when capacity is full again or the end of the waitlist is reached.
     */
    @Transactional
    protected void promoteFromWaitlist(TourOccurrence occurrence) {
        List<WaitlistEntry> queue = waitlistRepository
                .findByOccurrenceAndDeletedAtUtcIsNullOrderByPositionAsc(occurrence);

        int maxCapacity = getEffectiveCapacity(occurrence);

        for (WaitlistEntry entry : queue) {
            int available = maxCapacity - getSeatsReservedSafe(occurrence);

            // Only promote if the entire requested group fits
            if (entry.getPeopleCount() <= available) {
                // Create a real Booking for the promoted traveler
                Booking promoted = new Booking();
                promoted.setTraveler(entry.getTraveler());
                promoted.setOccurrence(occurrence);
                promoted.setPeopleCount(entry.getPeopleCount());
                boolean isInstant = occurrence.getTemplate().getInstantBook() != null && occurrence.getTemplate().getInstantBook();
                promoted.setBookingMode(isInstant ? BookingMode.Instant : BookingMode.Request);
                promoted.setStatus(isInstant ? BookingStatus.Confirmed : BookingStatus.PendingGuide);
                promoted.setBasePriceSnapshot(occurrence.getTemplate().getBasePrice());
                promoted.setCurrency(occurrence.getTemplate().getCurrency() != null
                        ? occurrence.getTemplate().getCurrency() : "USD");
                
                calculateAndSetFinalPrice(promoted, occurrence.getTemplate());
                promoted.setQrCode(UUID.randomUUID().toString());

                // Snapshot platform fee (default 10% for now)
                promoted.setPlatformFeeSnapshot(promoted.getFinalPrice().multiply(new BigDecimal("0.10")));

                bookingRepository.save(promoted);

                // Reserve the seats
                int newReserved = getSeatsReservedSafe(occurrence) + entry.getPeopleCount();
                occurrence.setSeatsReserved(newReserved);
                // Sync the new available_seats column
                occurrence.setAvailableSeats(Math.max(0, getEffectiveCapacity(occurrence) - newReserved));

                // Mark the waitlist entry as promoted and soft-delete it
                entry.setPromoted(true);
                entry.setPromotedAtUtc(Instant.now());
                entry.setDeletedAtUtc(Instant.now());
                waitlistRepository.save(entry);

                // Decrement the waitlist counter
                occurrence.setWaitlistCount(Math.max(0, getWaitlistCountSafe(occurrence) - entry.getPeopleCount()));
            }

            // If we're full again, we can stop early
            if (getSeatsReservedSafe(occurrence) >= maxCapacity) {
                occurrence.setStatus(TourOccurrenceStatus.FULL);
                break;
            }
        }
        occurrenceRepository.save(occurrence);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private TravelerProfile resolveTraveler(String email) {
        return travelerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Traveler profile not found"));
    }

    private GuideProfile resolveGuide(String email) {
        return guideRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Guide profile not found"));
    }

    private TourOccurrence resolveOccurrence(Long id) {
        TourOccurrence o = occurrenceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour occurrence not found"));
        if (o.getDeletedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This tour occurrence is no longer available");
        }
        return o;
    }

    /**
     * Validates that an occurrence can still accept new bookings.
     * Guards against: cancelled runs, completed runs, admin kill-switch, past start times.
     */
    private void validateOccurrenceBookable(TourOccurrence o) {
        if (o.getStatus() == TourOccurrenceStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This occurrence has been cancelled");
        }
        if (o.getStatus() == TourOccurrenceStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This occurrence has already taken place");
        }
        if (Boolean.TRUE.equals(o.getIsKillSwitched())) {
            throw new ResponseStatusException(HttpStatus.GONE,
                    "This occurrence is temporarily unavailable");
        }
        if (o.getStartTimeUtc().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This occurrence has already started");
        }
    }

    private void validateTravelerEligibility(TravelerProfile traveler) {
        var user = traveler.getUser();
        
        // Only users with the Traveler role are allowed to book
        if (user.getRole() != User.Role.Traveler) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only travelers are allowed to book tours");
        }

        if (!Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Please verify your email address before booking");
        }
        if (!Boolean.TRUE.equals(user.getProfileCompleted())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Please complete your profile before booking");
        }
    }

    private void validateCheckInTime(Booking booking) {
        Instant now = Instant.now();
        Instant startTime = booking.getOccurrence().getStartTimeUtc();
        // Allow check-in up to 2 hours before the tour starts
        if (now.isBefore(startTime.minus(Duration.ofHours(2)))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check-in is only available 2 hours before the tour starts");
        }
    }

    private void validateNoShowTime(Booking booking) {
        Instant now = Instant.now();
        Instant startTime = booking.getOccurrence().getStartTimeUtc();
        // Marking as No-Show is only available after the tour starts
        if (now.isBefore(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Marking as No-Show is only available after the tour starts");
        }
    }

    private Booking resolveTravelerBooking(Long id, String email) {
        return bookingRepository.findByIdAndTravelerUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found"));
    }

    private Booking resolveGuideBooking(Long id, String email) {
        return bookingRepository.findByIdAndOccurrenceTemplateGuideUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Booking not found"));
    }

    private void calculateAndSetFinalPrice(Booking booking, com.travelmarket.backend.tour.entity.TourTemplate template) {
        BigDecimal basePrice = booking.getBasePriceSnapshot();
        if (basePrice == null) basePrice = template.getBasePrice();
        
        int peopleCount = booking.getPeopleCount();
        BigDecimal subtotal = basePrice.multiply(BigDecimal.valueOf(peopleCount));
        BigDecimal finalPrice = subtotal;

        // 1. Apply group discount if applicable
        if (Boolean.TRUE.equals(template.getHasGroupDiscount()) 
                && template.getGroupDiscountThreshold() != null 
                && peopleCount >= template.getGroupDiscountThreshold()) {
            
            BigDecimal discountPercent = template.getGroupDiscountPercent() != null 
                    ? template.getGroupDiscountPercent() 
                    : BigDecimal.ZERO;
            
            if (discountPercent.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discount = subtotal.multiply(discountPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                finalPrice = subtotal.subtract(discount);
                booking.setGroupDiscountPercentSnapshot(discountPercent);
            }
        }

        // 2. Apply Dynamic Pricing (Weekends and Holidays)
        finalPrice = applyDynamicPricing(finalPrice, template, booking.getOccurrence().getStartTimeUtc());
        
        booking.setFinalPrice(finalPrice.setScale(2, RoundingMode.HALF_UP));
    }

    private BigDecimal applyDynamicPricing(BigDecimal price, com.travelmarket.backend.tour.entity.TourTemplate template, Instant tourDate) {
        String json = template.getDynamicPricing();
        if (json == null || json.isEmpty()) return price;

        try {
            JsonNode root = objectMapper.readTree(json);
            double weekendMultiplier = root.path("weekendMultiplier").asDouble(1.0);
            double holidayMultiplier = root.path("holidayMultiplier").asDouble(1.0);

            // Legacy & Frontend consistency check: 
            // If the multiplier is e.g. 120 (percent), we treat it as 1.2
            if (weekendMultiplier > 5.0) weekendMultiplier /= 100.0;
            if (holidayMultiplier > 5.0) holidayMultiplier /= 100.0;
            
            ZonedDateTime zdt = tourDate.atZone(ZoneId.of("UTC")); // Or "Asia/Beirut" if preferred
            DayOfWeek dow = zdt.getDayOfWeek();
            int month = zdt.getMonthValue();
            int day = zdt.getDayOfMonth();

            // 1. Check for Holidays (Fixed Lebanese Holidays)
            boolean isHoliday = isFixedLebaneseHoliday(month, day);
            if (isHoliday && holidayMultiplier != 1.0) {
                // Safety: prevent insane multipliers (cap at 5.0 for now)
                double safeMultiplier = Math.min(holidayMultiplier, 5.0);
                return price.multiply(BigDecimal.valueOf(safeMultiplier));
            }

            // 2. Check for Weekends (Sat/Sun)
            if ((dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) && weekendMultiplier != 1.0) {
                double safeMultiplier = Math.min(weekendMultiplier, 5.0);
                return price.multiply(BigDecimal.valueOf(safeMultiplier));
            }

        } catch (Exception e) {
            // Log error or ignore parse errors
        }
        return price;
    }

    private boolean isFixedLebaneseHoliday(int month, int day) {
        // Standard non-working days in Lebanon
        if (month == 1 && day == 1) return true;   // New Year
        if (month == 1 && day == 6) return true;   // Armenian Christmas
        if (month == 2 && day == 9) return true;   // St Maron
        if (month == 3 && day == 25) return true;  // Annunciation
        if (month == 5 && day == 1) return true;   // Labour Day
        if (month == 5 && day == 25) return true;  // Resistance & Liberation
        if (month == 8 && day == 15) return true;  // Assumption
        if (month == 11 && day == 1) return true;  // All Saints
        if (month == 11 && day == 22) return true; // Independence
        if (month == 12 && day == 25) return true; // Christmas
        return false;
    }

    /**
     * Lazy-synchronizes booking statuses based on current time.
     * Transition rules:
     *   - IN_PROGRESS -> COMPLETED: if now > endTimeUtc + 1 hour.
     *   - CONFIRMED -> CANCELLED (No-Show): if now > startTimeUtc + 2 hours and not checked in.
     *
     * This ensures travelers see 'Completed' as soon as their tour ends,
     * unlocking review eligibility even if the guide forgets to mark it.
     */
    private void syncBookingStatuses(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) return;
        Instant now = Instant.now();

        for (Booking b : bookings) {
            if (b.getOccurrence() == null || b.getOccurrence().getDeletedAtUtc() != null) continue;

            // 1. IN_PROGRESS -> COMPLETED (Stale active tours)
            if (b.getStatus() == BookingStatus.InProgress) {
                Instant autoCompleteBuffer = b.getOccurrence().getEndTimeUtc().plus(java.time.Duration.ofHours(1));
                if (now.isAfter(autoCompleteBuffer)) {
                    log.info("[Automation] Auto-completing stale InProgress booking ID: {} (Tour ended at: {})",
                            b.getId(), b.getOccurrence().getEndTimeUtc());
                    b.setStatus(BookingStatus.Completed);
                    b.setCompletedAtUtc(b.getOccurrence().getEndTimeUtc());

                    // Increment traveler's total completed trips
                    TravelerProfile traveler = b.getTraveler();
                    if (traveler != null) {
                        traveler.setTotalCompletedTrips((traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
                        travelerRepository.save(traveler);
                    }

                    bookingRepository.save(b);
                    // Schedule guide payout after freeze window
                    stripePaymentService.scheduleGuidePayoutFor(b);
                }
            }
            
            // 2. CONFIRMED -> CANCELLED (No-Show)
            else if (b.getStatus() == BookingStatus.Confirmed) {
                Instant noShowBuffer = b.getOccurrence().getStartTimeUtc().plus(java.time.Duration.ofHours(2));
                if (now.isAfter(noShowBuffer)) {
                    log.info("[Automation] Auto-cancelling stale Confirmed booking (No-Show) ID: {} (Tour started at: {})", 
                            b.getId(), b.getOccurrence().getStartTimeUtc());
                    b.setStatus(BookingStatus.Cancelled);
                    b.setCancelledAtUtc(now);
                    b.setCancellationReason("Traveler No-Show (Auto-processed)");
                    b.setRefundPercent(java.math.BigDecimal.ZERO);
                    
                    releaseSeats(b.getOccurrence(), b.getPeopleCount());
                    promoteFromWaitlist(b.getOccurrence());
                    
                    bookingRepository.save(b);
                }
            }
        }
    }

    // ── DTO Mapping ───────────────────────────────────────────────────────────

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
                .tourId(b.getOccurrence().getTemplate().getId())
                .tourCoverImageUrl(null) // TODO: resolve from TourMedia in media card
                .startTimeUtc(b.getOccurrence().getStartTimeUtc())
                .endTimeUtc(b.getOccurrence().getEndTimeUtc())
                // Meeting point is private — only reveal once the booking is confirmed
                .meetingPointName(
                        b.getStatus() == BookingStatus.Confirmed
                                || b.getStatus() == BookingStatus.InProgress
                                || b.getStatus() == BookingStatus.Completed
                                ? b.getOccurrence().getTemplate().getMeetingPointName()
                                : null)
                .status(b.getStatus().name())
                .bookingMode(b.getBookingMode() != null ? b.getBookingMode().name() : null)
                .peopleCount(b.getPeopleCount())
                .finalPrice(b.getFinalPrice())
                .currency(b.getCurrency())
                // QR token included in traveler's own booking response for check-in display
                .qrCode(b.getQrCode())
                .cancellationReason(b.getCancellationReason())
                .refundPercent(b.getRefundPercent())
                .cancelledAtUtc(b.getCancelledAtUtc())
                .waiverSigned(b.getWaiverSigned())
                .createdAtUtc(b.getCreatedAtUtc())
                .build();
    }

    private GuideBookingResponse mapToGuideResponse(Booking b) {
        return GuideBookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
                .tourId(b.getOccurrence().getTemplate().getId())
                .startTimeUtc(b.getOccurrence().getStartTimeUtc())
                .endTimeUtc(b.getOccurrence().getEndTimeUtc())
                .status(b.getStatus().name())
                .bookingMode(b.getBookingMode() != null ? b.getBookingMode().name() : null)
                .peopleCount(b.getPeopleCount())
                .durationHours(b.getOccurrence().getTemplate().getDurationHours())
                .durationMinutes(b.getOccurrence().getTemplate().getDurationMinutes())
                .finalPrice(b.getFinalPrice())
                .platformFee(b.getPlatformFeeSnapshot() != null ? b.getPlatformFeeSnapshot() : java.math.BigDecimal.ZERO)
                .netEarnings(b.getFinalPrice().subtract(b.getPlatformFeeSnapshot() != null ? b.getPlatformFeeSnapshot() : java.math.BigDecimal.ZERO))
                .currency(b.getCurrency())
                .cancellationReason(b.getCancellationReason())
                .checkedInAtUtc(b.getCheckedInAtUtc())
                .completedAtUtc(b.getCompletedAtUtc())
                .createdAtUtc(b.getCreatedAtUtc())
                // Guide gets traveler contact info for logistics only — not full profile
                .traveler(GuideBookingResponse.TravelerInfo.builder()
                        .id(b.getTraveler().getId())
                        .fullName(b.getTraveler().getUser().getFullName())
                        .email(b.getTraveler().getUser().getEmail())
                        .phoneE164(b.getTraveler().getUser().getPhoneE164())
                        .build())
                .build();
    }

    private WaitlistResponse mapToWaitlistResponse(WaitlistEntry w) {
        return WaitlistResponse.builder()
                .id(w.getId())
                .occurrenceId(w.getOccurrence().getId())
                .tourTitle(w.getOccurrence().getTemplate().getTitle())
                .startTimeUtc(w.getOccurrence().getStartTimeUtc())
                .endTimeUtc(w.getOccurrence().getEndTimeUtc())
                .position(w.getPosition())
                .peopleCount(w.getPeopleCount())
                .notified(w.getNotified())
                .promoted(w.getPromoted())
                .promotedAtUtc(w.getPromotedAtUtc())
                .createdAtUtc(w.getCreatedAtUtc())
                .build();
    }

    /**
     * Periodically called to clean up stale bookings that guides forgot to process.
     */
    @Transactional
    public void processStaleBookings() {
        java.time.Instant now = java.time.Instant.now();
        
        // 1. InProgress -> Completed (1 hour buffer after scheduled end)
        List<com.travelmarket.backend.booking.entity.Booking> staleInProgress = bookingRepository.findStaleInProgressBookings(now.minus(java.time.Duration.ofHours(1)));
        for (com.travelmarket.backend.booking.entity.Booking b : staleInProgress) {
            b.setStatus(com.travelmarket.backend.booking.enums.BookingStatus.Completed);
            b.setCompletedAtUtc(b.getOccurrence().getEndTimeUtc());
            com.travelmarket.backend.entity.TravelerProfile traveler = b.getTraveler();
            if (traveler != null) {
                traveler.setTotalCompletedTrips((traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
                travelerRepository.save(traveler);
            }
            bookingRepository.save(b);
            stripePaymentService.scheduleGuidePayoutFor(b);
            log.info("Auto-completed stale booking ID: {}", b.getId());
        }

        // 2. Confirmed -> Cancelled (No-Show) (2 hour buffer after scheduled start)
        List<com.travelmarket.backend.booking.entity.Booking> staleConfirmed = bookingRepository.findStaleConfirmedBookings(now.minus(java.time.Duration.ofHours(2)));
        for (com.travelmarket.backend.booking.entity.Booking b : staleConfirmed) {
            b.setStatus(com.travelmarket.backend.booking.enums.BookingStatus.Cancelled);
            b.setCancelledAtUtc(now);
            b.setCancellationReason("Traveler No-Show (Auto-processed)");
            b.setRefundPercent(java.math.BigDecimal.ZERO);
            
            releaseSeats(b.getOccurrence(), b.getPeopleCount());
            promoteFromWaitlist(b.getOccurrence());
            
            bookingRepository.save(b);
            log.info("Auto-cancelled stale confirmed booking (No-Show) ID: {}", b.getId());
        }
    }
}