package com.travelmarket.backend.booking.service;

import com.travelmarket.backend.booking.dto.request.*;
import com.travelmarket.backend.booking.dto.response.*;
import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.entity.WaitlistEntry;
import com.travelmarket.backend.booking.enums.BookingMode;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.booking.repository.WaitlistRepository;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;
    private final TourOccurrenceRepository occurrenceRepository;
    private final TravelerProfileRepository travelerRepository;
    private final GuideProfileRepository guideRepository;

    // ── Traveler: Create Booking ──────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        TravelerProfile traveler = resolveTraveler(email);
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

        // TODO (payment card): apply promo code, group discount, tier discount here
        // and populate the corresponding snapshot fields before computing finalPrice.
        // For now: finalPrice = basePrice × peopleCount, no discounts applied.
        booking.setFinalPrice(basePrice.multiply(BigDecimal.valueOf(request.getPeopleCount())));

        // Snapshot platform fee (default 10% for now — feeds cancellation refund calc)
        booking.setPlatformFeeSnapshot(booking.getFinalPrice().multiply(new BigDecimal("0.10")));

        // Resolve booking mode from the template and snapshot it onto the booking.
        // A guide flipping instantBook later won't affect bookings already in flight.
        boolean isInstant = Boolean.TRUE.equals(occurrence.getTemplate().getInstantBook());
        booking.setBookingMode(isInstant ? BookingMode.Instant : BookingMode.Request);

        if (isInstant) {
            // Instant Book: seat is reserved immediately upon booking creation.
            // TODO (payment card): intercept here — status should become PENDING_PAYMENT
            // and only advance to CONFIRMED once Whish captures the payment.
            booking.setStatus(BookingStatus.Confirmed);
            occurrence.setSeatsReserved(newTotalSeats);
            // If we just consumed the last available seat, mark occurrence as FULL
            if (newTotalSeats >= maxCapacity) {
                occurrence.setStatus(TourOccurrenceStatus.FULL);
            }
            occurrenceRepository.save(occurrence);
        } else {
            // Request to Book: seat is NOT reserved until the guide explicitly confirms.
            // Guide has 24 h to respond before the booking auto-expires (future automation card).
            booking.setStatus(BookingStatus.PendingGuide);
        }

        // Generate the check-in QR token. Encoded in the traveler's QR code display.
        // The guide's scanner sends this token to /guide/bookings/checkin-by-qr/{token}
        // where it is validated against the guide's own occurrences server-side.
        booking.setQrCode(UUID.randomUUID().toString());

        return mapToResponse(bookingRepository.save(booking));
    }

    // ── Traveler: Read ────────────────────────────────────────────────────────

    // @Transactional(readOnly = true) is required on all read methods.
    // Without it, Hibernate closes the session before mapToResponse() accesses
    // lazy associations like occurrence.template.title and traveler.user.fullName,
    // causing LazyInitializationException at runtime.

    @Transactional(readOnly = true)
    public List<BookingResponse> getTravelerBookings(String email) {
        TravelerProfile traveler = resolveTraveler(email);
        return bookingRepository.findByTravelerOrderByCreatedAtUtcDesc(traveler)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getTravelerBooking(String email, Long id) {
        return mapToResponse(resolveTravelerBooking(id, email));
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

        // Only CONFIRMED and IN_PROGRESS bookings hold reserved seats — release them
        if (booking.getStatus() == BookingStatus.Confirmed
                || booking.getStatus() == BookingStatus.InProgress) {
            TourOccurrence occurrence = booking.getOccurrence();
            int released = Math.max(0, occurrence.getSeatsReserved() - booking.getPeopleCount());
            occurrence.setSeatsReserved(released);
            // If occurrence was FULL, it now has capacity again
            if (occurrence.getStatus() == TourOccurrenceStatus.FULL) {
                occurrence.setStatus(TourOccurrenceStatus.SCHEDULED);
            }
            occurrenceRepository.save(occurrence);

            // Offer the freed seat to the next traveler in the waitlist queue
            promoteFromWaitlist(occurrence);
        }

        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(now);
        booking.setCancellationReason(
                request != null && request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "Cancelled by Traveler");

        return mapToResponse(bookingRepository.save(booking));
    }

    // ── Guide: Read ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GuideBookingResponse> getGuideBookings(String email) {
        GuideProfile guide = resolveGuide(email);
        return bookingRepository.findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(guide)
                .stream().map(this::mapToGuideResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuideBookingResponse getGuideBooking(String email, Long id) {
        return mapToGuideResponse(resolveGuideBooking(id, email));
    }

    // ── Guide: Accept / Reject Request Bookings ───────────────────────────────

    @Transactional
    public GuideBookingResponse confirmBooking(String email, Long id) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is not pending guide confirmation");
        }

        TourOccurrence occurrence = booking.getOccurrence();
        int newTotal = occurrence.getSeatsReserved() + booking.getPeopleCount();

        // Re-validate capacity — instant bookings from other travelers may have
        // filled seats since this request-booking was submitted
        if (newTotal > occurrence.getTemplate().getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot confirm: occurrence is now at full capacity");
        }

        booking.setStatus(BookingStatus.Confirmed);
        occurrence.setSeatsReserved(newTotal);
        if (newTotal >= occurrence.getTemplate().getMaxCapacity()) {
            occurrence.setStatus(TourOccurrenceStatus.FULL);
        }
        occurrenceRepository.save(occurrence);

        return mapToGuideResponse(bookingRepository.save(booking));
    }

    @Transactional
    public GuideBookingResponse rejectBooking(String email, Long id, RejectBookingRequest request) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is not pending guide confirmation");
        }

        // PENDING_GUIDE bookings never held reserved seats, so no seat adjustment needed
        booking.setStatus(BookingStatus.Cancelled);
        booking.setCancelledAtUtc(Instant.now());
        booking.setCancellationReason(
                request != null && request.getReason() != null && !request.getReason().isBlank()
                        ? request.getReason()
                        : "Rejected by Guide");

        return mapToGuideResponse(bookingRepository.save(booking));
    }

    // ── Guide: QR Check-in & Completion ──────────────────────────────────────

    /**
     * Check-in via booking database id.
     * Used when the guide taps a booking directly from their dashboard list
     * rather than scanning a QR code.
     */
    @Transactional
    public GuideBookingResponse checkIn(String email, Long id) {
        Booking booking = resolveGuideBooking(id, email);

        if (booking.getStatus() != BookingStatus.Confirmed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking must be CONFIRMED before check-in");
        }

        // CONFIRMED → IN_PROGRESS: guide has physically verified the traveler
        // at the meeting point. checkedInAtUtc is used by the no-show card to
        // determine if a traveler was actually present.
        booking.setStatus(BookingStatus.InProgress);
        booking.setCheckedInAtUtc(Instant.now());

        return mapToGuideResponse(bookingRepository.save(booking));
    }

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

        if (booking.getStatus() != BookingStatus.Confirmed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking must be CONFIRMED before check-in");
        }

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
        // completedAtUtc starts the 48 h payout freeze window (future payout card).
        // COMPLETED status also unlocks review eligibility (future review card).
        booking.setStatus(BookingStatus.Completed);
        booking.setCompletedAtUtc(Instant.now());

        return mapToGuideResponse(bookingRepository.save(booking));
    }

    // ── Waitlist ──────────────────────────────────────────────────────────────

    @Transactional
    public WaitlistResponse joinWaitlist(String email, JoinWaitlistRequest request) {
        TravelerProfile traveler = resolveTraveler(email);
        TourOccurrence occurrence = resolveOccurrence(request.getOccurrenceId());

        // Waitlist only makes sense for occurrences that are genuinely full
        if (occurrence.getStatus() != TourOccurrenceStatus.FULL
                && occurrence.getSeatsReserved() < occurrence.getTemplate().getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This occurrence is not full — you can book directly");
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
                (occurrence.getWaitlistCount() != null ? occurrence.getWaitlistCount() : 0) + 1);
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
                        ? occurrence.getWaitlistCount() : 1) - 1));
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

        int maxCapacity = occurrence.getTemplate().getMaxCapacity();

        for (WaitlistEntry entry : queue) {
            int available = maxCapacity - occurrence.getSeatsReserved();

            // Only promote if the entire requested group fits
            if (entry.getPeopleCount() <= available) {
                // Create a real Booking for the promoted traveler
                Booking promoted = new Booking();
                promoted.setTraveler(entry.getTraveler());
                promoted.setOccurrence(occurrence);
                promoted.setPeopleCount(entry.getPeopleCount());
                promoted.setBookingMode(BookingMode.Instant);
                promoted.setStatus(BookingStatus.Confirmed); // TODO: PENDING_PAYMENT (payment card)
                promoted.setBasePriceSnapshot(occurrence.getTemplate().getBasePrice());
                promoted.setCurrency(occurrence.getTemplate().getCurrency() != null
                        ? occurrence.getTemplate().getCurrency() : "USD");
                promoted.setFinalPrice(occurrence.getTemplate().getBasePrice()
                        .multiply(BigDecimal.valueOf(entry.getPeopleCount())));
                promoted.setQrCode(UUID.randomUUID().toString());

                // Snapshot platform fee (default 10% for now)
                promoted.setPlatformFeeSnapshot(promoted.getFinalPrice().multiply(new BigDecimal("0.10")));

                bookingRepository.save(promoted);

                // Reserve the seats
                occurrence.setSeatsReserved(occurrence.getSeatsReserved() + entry.getPeopleCount());

                // Mark the waitlist entry as promoted and soft-delete it
                entry.setPromoted(true);
                entry.setPromotedAtUtc(Instant.now());
                entry.setDeletedAtUtc(Instant.now());
                waitlistRepository.save(entry);

                // Decrement the waitlist counter
                occurrence.setWaitlistCount(Math.max(0, occurrence.getWaitlistCount() - 1));
            }

            // If we're full again, we can stop early
            if (occurrence.getSeatsReserved() >= maxCapacity) {
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

    // ── DTO Mapping ───────────────────────────────────────────────────────────

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
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
                .createdAtUtc(b.getCreatedAtUtc())
                .build();
    }

    private GuideBookingResponse mapToGuideResponse(Booking b) {
        return GuideBookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
                .startTimeUtc(b.getOccurrence().getStartTimeUtc())
                .endTimeUtc(b.getOccurrence().getEndTimeUtc())
                .status(b.getStatus().name())
                .bookingMode(b.getBookingMode() != null ? b.getBookingMode().name() : null)
                .peopleCount(b.getPeopleCount())
                .finalPrice(b.getFinalPrice())
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
}