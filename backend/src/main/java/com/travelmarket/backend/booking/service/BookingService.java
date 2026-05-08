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
import com.travelmarket.backend.service.TimeService;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.enums.TourMediaType;
import com.travelmarket.backend.tour.entity.TourMedia;
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
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
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
    /** Centralized UTC time — use this everywhere instead of Instant.now() inline */
    private final TimeService timeService;
    /** Central pricing logic — loyalty discounts, platform fee, dynamic pricing. */
    private final PricingService pricingService;
    @Lazy
    private final StripePaymentService stripePaymentService;

    // ── Traveler: Create Booking ──────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        TravelerProfile traveler = resolveTraveler(email);
        validateTravelerEligibility(traveler);

        // ── CRITICAL SECTION START ─────────────────────────────────────────────
        // Acquire a PostgreSQL row-level exclusive lock (SELECT ... FOR UPDATE) on
        // the TourOccurrence row BEFORE reading seatsReserved or writing anything.
        //
        // This ensures only ONE transaction at a time can execute the
        // check-availability → reserve-seats → save-booking sequence for a given slot.
        //
        // All concurrent requests for the same occurrence will block here until the
        // first request commits (lock released). They then re-read the updated
        // seatsReserved value and correctly see the tour is full.
        TourOccurrence occurrence = resolveOccurrenceWithLock(request.getOccurrenceId());

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

        // Snapshot all pricing via PricingService — applies loyalty discount + group discount
        // + dynamic pricing (weekend/holiday) in one consistent pipeline.
        BigDecimal basePrice = occurrence.getTemplate().getBasePrice();
        booking.setBasePriceSnapshot(basePrice);
        booking.setCurrency(occurrence.getTemplate().getCurrency() != null
                ? occurrence.getTemplate().getCurrency() : "USD");

        // Build the full price breakdown (group → loyalty → dynamic → platform fee)
        PriceBreakdown breakdown = pricingService.calculatePrice(
                occurrence.getTemplate(), occurrence, traveler, request.getPeopleCount());

        // Snapshot every discount component so cancellation / payout cards have full history
        booking.setFinalPrice(breakdown.getFinalPrice());
        booking.setPlatformFeeSnapshot(breakdown.getPlatformFeeAmount());
        booking.setGroupDiscountPercentSnapshot(breakdown.getGroupDiscountPct());
        booking.setTierDiscountPercentSnapshot(breakdown.getTierDiscountPct());

        // Resolve booking mode from the template and snapshot it onto the booking.
        // A guide flipping instantBook later won't affect bookings already in flight.
        boolean isInstant = Boolean.TRUE.equals(occurrence.getTemplate().getInstantBook());
        booking.setBookingMode(isInstant ? BookingMode.Instant : BookingMode.Request);

        if (isInstant) {
            // Instant Book: seats tentatively reserved while traveler completes payment.
            // The 15-minute payment deadline starts NOW (at booking creation), not when the
            // Stripe session is opened. This is the authoritative timeout anchor.
            // On payment success (webhook/mock-confirm): → Confirmed, deadline cleared.
            // On expiry (PaymentTimeoutJob fires after deadline): → Expired, seats released.
            booking.setStatus(BookingStatus.PendingPayment);
            reserveSeats(occurrence, newTotalSeats - occurrence.getSeatsReserved());

            // Set the 15-minute payment deadline at booking creation time.
            // PaymentTimeoutJob checks cartExpiresAtUtc every 60 seconds.
            // StripePaymentService.createCheckoutSession() may override this to 30 min
            // for real Stripe sessions (Stripe's minimum session window) — that is fine;
            // the backend job will still clean up if payment is never initiated at all.
            booking.setCartExpiresAtUtc(timeService.getCurrentUtc().plus(15, ChronoUnit.MINUTES));
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

        Instant now = timeService.getCurrentUtc();
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

        // Lock the old occurrence first (alphabetically smaller ID first to prevent deadlock
        // when two users simultaneously swap between the same two occurrences in opposite order).
        // We always lock the lower-ID occurrence first so lock ordering is deterministic.
        Long oldId = oldOccurrence.getId();
        Long newId = request.getOccurrenceId();

        TourOccurrence newOccurrence;
        if (!oldId.equals(newId)) {
            // Switching occurrences — lock BOTH rows in ID order to prevent deadlock.
            Long firstId  = (oldId < newId) ? oldId : newId;
            Long secondId = (oldId < newId) ? newId : oldId;
            TourOccurrence first  = resolveOccurrenceWithLock(firstId);
            TourOccurrence second = resolveOccurrenceWithLock(secondId);
            // Re-assign so oldOccurrence/newOccurrence point to the correctly locked instances
            oldOccurrence = first.getId().equals(oldId) ? first : second;
            newOccurrence = first.getId().equals(newId) ? first : second;
        } else {
            // Same occurrence — single lock suffices
            oldOccurrence = resolveOccurrenceWithLock(oldId);
            newOccurrence = oldOccurrence;
        }

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

        // Snapshot new pricing via PricingService
        PriceBreakdown updBreakdown = pricingService.calculatePrice(
                newOccurrence.getTemplate(), newOccurrence, booking.getTraveler(), newPeopleCount);
        booking.setFinalPrice(updBreakdown.getFinalPrice());
        booking.setPlatformFeeSnapshot(updBreakdown.getPlatformFeeAmount());
        booking.setGroupDiscountPercentSnapshot(updBreakdown.getGroupDiscountPct());
        booking.setTierDiscountPercentSnapshot(updBreakdown.getTierDiscountPct());

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
        booking.setCancelledAtUtc(timeService.getCurrentUtc());
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
        booking.setCancelledAtUtc(timeService.getCurrentUtc());
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
        booking.setCheckedInAtUtc(timeService.getCurrentUtc());

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
        booking.setCompletedAtUtc(timeService.getCurrentUtc());

        // Increment traveler's total completed trips, then recalculate loyalty tier.
        // PricingService owns the tier logic so thresholds remain configurable.
        TravelerProfile traveler = booking.getTraveler();
        traveler.setTotalCompletedTrips(
                (traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
        pricingService.recalculateLoyaltyTier(traveler);  // mutates traveler in-place
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
        booking.setCancelledAtUtc(timeService.getCurrentUtc());
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
    public List<WaitlistResponse> getGuideWaitlist(String email) {
        GuideProfile guide = resolveGuide(email);
        return waitlistRepository
                .findActiveByGuideEmail(email)
                .stream().map(this::mapToWaitlistResponse).collect(Collectors.toList());
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
        entry.setDeletedAtUtc(timeService.getCurrentUtc());
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
                
                // Build pricing via PricingService so promoted traveler also gets loyalty discount
                PriceBreakdown promoBreakdown = pricingService.calculatePrice(
                        occurrence.getTemplate(), occurrence, entry.getTraveler(), entry.getPeopleCount());
                promoted.setBasePriceSnapshot(occurrence.getTemplate().getBasePrice());
                promoted.setCurrency(occurrence.getTemplate().getCurrency() != null
                        ? occurrence.getTemplate().getCurrency() : "USD");
                promoted.setFinalPrice(promoBreakdown.getFinalPrice());
                promoted.setPlatformFeeSnapshot(promoBreakdown.getPlatformFeeAmount());
                promoted.setGroupDiscountPercentSnapshot(promoBreakdown.getGroupDiscountPct());
                promoted.setTierDiscountPercentSnapshot(promoBreakdown.getTierDiscountPct());
                promoted.setQrCode(UUID.randomUUID().toString());

                bookingRepository.save(promoted);

                // Reserve the seats
                int newReserved = getSeatsReservedSafe(occurrence) + entry.getPeopleCount();
                occurrence.setSeatsReserved(newReserved);
                // Sync the new available_seats column
                occurrence.setAvailableSeats(Math.max(0, getEffectiveCapacity(occurrence) - newReserved));

                // Mark the waitlist entry as promoted and soft-delete it
                entry.setPromoted(true);
                entry.setPromotedAtUtc(timeService.getCurrentUtc());
                entry.setDeletedAtUtc(timeService.getCurrentUtc());
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
     * Like resolveOccurrence(), but acquires a pessimistic write lock (SELECT ... FOR UPDATE)
     * on the TourOccurrence row in the database BEFORE returning it.
     *
     * Use this in ALL write paths that:
     *   1. Read seatsReserved
     *   2. Compute a new seat count
     *   3. Call reserveSeats() or releaseSeats()
     *
     * The lock is automatically released when the enclosing @Transactional method commits
     * or rolls back. No manual unlock is needed.
     *
     * NOT needed for pure read methods (getTravelerBookings, getGuideBooking, etc.) —
     * those do not modify seats and should NOT acquire write locks to avoid contention.
     *
     * Thread safety: if two transactions race to lock the same occurrence, one will block
     * for up to 2000 ms (configured via @QueryHints on the repository method). After that
     * deadline, PessimisticLockingFailureException is thrown and mapped to HTTP 409 by
     * GlobalExceptionHandler.
     */
    private TourOccurrence resolveOccurrenceWithLock(Long id) {
        // findByIdWithLock issues: SELECT ... FROM tour_occurrences WHERE id = ? AND deleted_at_utc IS NULL FOR UPDATE
        // This blocks any other transaction that also tries to lock or update this row
        // until the current transaction commits or rolls back.
        return occurrenceRepository.findByIdWithLock(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tour occurrence not found or no longer available"));
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
        if (o.getStartTimeUtc().isBefore(timeService.getCurrentUtc())) {
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

                    // Increment completed trips and auto-upgrade loyalty tier
                    TravelerProfile traveler = b.getTraveler();
                    if (traveler != null) {
                        traveler.setTotalCompletedTrips(
                                (traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
                        pricingService.recalculateLoyaltyTier(traveler); // tier auto-upgrade
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
        // Compute the absolute loyalty discount amount from snapshots.
        // tierDiscountPercentSnapshot is the percent applied at booking time.
        // We derive the pre-discount subtotal: finalPrice / (1 - pct/100) ≈ finalPrice + discount.
        // Simpler derivation: note that tierDiscount was applied after group discount,
        // so: tierDiscountAmount = (preTierPrice) * pct / 100.
        // Since we don't store preTierPrice separately, we approximate:
        //   tierDiscountAmount = finalPrice * (tierPct / (100 - tierPct))  — only valid for small pct.
        // Safer: just record the raw pct and let the frontend compute or show percentage.
        // For the absolute amount, compute from basePriceSnapshot × peopleCount × (1 - groupDisc) × tierPct:
        BigDecimal tierDiscountPct = b.getTierDiscountPercentSnapshot();
        BigDecimal tierDiscountAmount = BigDecimal.ZERO;
        if (tierDiscountPct != null && tierDiscountPct.compareTo(BigDecimal.ZERO) > 0
                && b.getBasePriceSnapshot() != null && b.getPeopleCount() != null) {
            // subtotal after group discount (approximate: we don't store it separately)
            BigDecimal subtotal = b.getBasePriceSnapshot()
                    .multiply(BigDecimal.valueOf(b.getPeopleCount()));
            BigDecimal groupDisc = b.getGroupDiscountPercentSnapshot() != null
                    ? b.getGroupDiscountPercentSnapshot() : BigDecimal.ZERO;
            BigDecimal afterGroup = subtotal.multiply(
                    BigDecimal.ONE.subtract(groupDisc.divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP)));
            tierDiscountAmount = afterGroup.multiply(
                    tierDiscountPct.divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        }

        return BookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
                .tourId(b.getOccurrence().getTemplate().getId())
                .tourCoverImageUrl(b.getOccurrence().getTemplate().getMedia().stream()
                        .filter(m -> m.getMediaType() == TourMediaType.IMAGE)
                        .sorted(Comparator.comparingInt(TourMedia::getDisplayOrder))
                        .findFirst()
                        .map(TourMedia::getUrl)
                        .orElse(null))
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
                // Payment deadline — only meaningful while status is PendingPayment.
                // cartExpiresAtUtc is set at booking creation (15 min) and cleared
                // by StripePaymentService once payment is confirmed.
                .paymentDeadlineUtc(
                        b.getStatus() == BookingStatus.PendingPayment
                                ? b.getCartExpiresAtUtc()
                                : null)
                .guideId(b.getOccurrence().getTemplate().getGuide().getUser().getId())
                .guideName(b.getOccurrence().getTemplate().getGuide().getUser().getFullName())
                // Loyalty discount snapshots — used by frontend for "You saved $X" banner
                .tierDiscountPct(tierDiscountPct)
                .tierDiscountAmount(tierDiscountAmount.compareTo(BigDecimal.ZERO) > 0 ? tierDiscountAmount : null)
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
                .travelerId(w.getTraveler().getId())
                .travelerName(w.getTraveler().getUser().getFullName())
                .travelerEmail(w.getTraveler().getUser().getEmail())
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
     * Handles InProgress → Completed and Confirmed → Cancelled (No-Show) transitions.
     * Called by BookingStatusCleanupJob every hour.
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
                traveler.setTotalCompletedTrips(
                        (traveler.getTotalCompletedTrips() != null ? traveler.getTotalCompletedTrips() : 0) + 1);
                pricingService.recalculateLoyaltyTier(traveler); // auto-upgrade tier
                travelerRepository.save(traveler);
            }
            bookingRepository.save(b);
            stripePaymentService.scheduleGuidePayoutFor(b);
            log.info("[Cleanup] Auto-completed stale InProgress booking ID: {}", b.getId());
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
            log.info("[Cleanup] Auto-cancelled stale confirmed booking (No-Show) ID: {}", b.getId());
        }
    }

    // ── Payment Timeout Cleanup ────────────────────────────────────────────────

    /**
     * Expires PendingPayment bookings whose 15-minute payment window has lapsed.
     *
     * Called every 60 seconds by PaymentTimeoutJob.
     *
     * Race-condition safety:
     *   - Query only matches status = PendingPayment — once StripePaymentService
     *     confirms payment and flips the status to Confirmed, this method will
     *     never touch that booking again.
     *   - If the scheduler and the Stripe webhook fire simultaneously, JPA
     *     optimistic locking (@Version on Booking) ensures only one writer wins.
     *     The other will get an OptimisticLockException which is silently swallowed
     *     here (the booking is already Confirmed, so no action needed).
     *
     * Notifications sent:
     *   - Traveler: BOOKING_EXPIRED — "Your booking was cancelled (payment timeout)"
     *   - Guide:    BOOKING_CANCELLED — "A booking was cancelled (no payment received)"
     */
    @Transactional
    public void processExpiredPendingPayments() {
        Instant now = Instant.now();

        // Find all PendingPayment bookings with a cartExpiresAtUtc in the past
        List<Booking> expired = bookingRepository.findStalePendingPaymentBookings(now);

        if (expired.isEmpty()) {
            return; // Nothing to do — avoid noisy logs on every run
        }

        log.info("[PaymentTimeout] Found {} expired PendingPayment booking(s) to process", expired.size());

        for (Booking b : expired) {
            try {
                // ── Transition: PendingPayment → Expired ──────────────────────
                b.setStatus(BookingStatus.Expired);
                b.setCancelledAtUtc(now);
                b.setCancellationReason("Payment not completed within 15-minute window");

                // Release the seats that were tentatively reserved at booking creation.
                // This allows other travelers to book or promotes the next waitlist entry.
                releaseSeats(b.getOccurrence(), b.getPeopleCount());
                promoteFromWaitlist(b.getOccurrence());

                bookingRepository.save(b);

                String tourTitle = b.getOccurrence().getTemplate().getTitle();
                Long travelerId  = b.getTraveler().getUser().getId();
                Long guideUserId = b.getOccurrence().getTemplate().getGuide().getUser().getId();
                String bookingIdStr = b.getId().toString();

                // ── Notify traveler ───────────────────────────────────────────
                notificationService.createNotification(
                        travelerId,
                        com.travelmarket.backend.notification.enums.NotificationType.BOOKING_EXPIRED,
                        "Booking Expired",
                        "Your booking for \"" + tourTitle + "\" was automatically cancelled "
                                + "because payment was not completed within 15 minutes. "
                                + "You can book again if seats are still available.",
                        bookingIdStr,
                        "BOOKING"
                );

                // ── Notify guide (optional but recommended) ───────────────────
                notificationService.createNotification(
                        guideUserId,
                        com.travelmarket.backend.notification.enums.NotificationType.BOOKING_CANCELLED,
                        "Booking Cancelled (No Payment)",
                        "A booking for \"" + tourTitle + "\" was automatically cancelled "
                                + "because the traveler did not complete payment within 15 minutes. "
                                + "The seat has been released.",
                        bookingIdStr,
                        "BOOKING"
                );

                log.info("[PaymentTimeout] ⏰ Expired PendingPayment booking ID: {} for tour: '{}'",
                        b.getId(), tourTitle);

            } catch (Exception e) {
                // Log and continue — don't let one failed booking block the rest.
                // Likely cause: OptimisticLockException (payment confirmed concurrently).
                log.warn("[PaymentTimeout] Could not expire booking ID: {} — possibly confirmed concurrently. Cause: {}",
                        b.getId(), e.getMessage());
            }
        }
    }
}