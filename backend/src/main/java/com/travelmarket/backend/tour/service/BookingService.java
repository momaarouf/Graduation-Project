package com.travelmarket.backend.tour.service;

import com.travelmarket.backend.entity.Booking;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.repository.BookingRepository;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.tour.dto.request.CreateBookingRequest;
import com.travelmarket.backend.tour.dto.response.BookingResponse;
import com.travelmarket.backend.tour.dto.response.GuideBookingResponse;
import com.travelmarket.backend.tour.entity.TourOccurrence;
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
    private final TourOccurrenceRepository occurrenceRepository;
    private final TravelerProfileRepository travelerRepository;
    private final GuideProfileRepository guideRepository;

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        TravelerProfile traveler = travelerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traveler profile not found"));

        TourOccurrence occurrence = occurrenceRepository.findById(request.getOccurrenceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour occurrence not found"));

        if (occurrence.getDeletedAtUtc() != null) {
            throw new ResponseStatusException(HttpStatus.GONE, "Occurrence is no longer available");
        }

        int totalSeats = (occurrence.getSeatsReserved() != null ? occurrence.getSeatsReserved() : 0) + request.getPeopleCount();
        if (totalSeats > occurrence.getTemplate().getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough seats available");
        }

        Booking booking = new Booking();
        booking.setTraveler(traveler);
        booking.setOccurrence(occurrence);
        booking.setPeopleCount(request.getPeopleCount());
        booking.setWaiverSigned(request.getWaiverSigned());
        booking.setFinalPrice(occurrence.getTemplate().getBasePrice().multiply(BigDecimal.valueOf(request.getPeopleCount())));
        booking.setCurrency(occurrence.getTemplate().getCurrency());
        booking.setBookingMode(Boolean.TRUE.equals(occurrence.getTemplate().getInstantBook()) ? "Instant" : "Request");
        
        if (Boolean.TRUE.equals(occurrence.getTemplate().getInstantBook())) {
            booking.setStatus(Booking.Status.Confirmed);
            occurrence.setSeatsReserved(totalSeats);
            occurrenceRepository.save(occurrence);
        } else {
            booking.setStatus(Booking.Status.PendingGuide);
        }

        booking.setQrCode(UUID.randomUUID().toString());
        booking = bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    public List<BookingResponse> getTravelerBookings(String email) {
        TravelerProfile traveler = travelerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traveler profile not found"));
        return bookingRepository.findByTravelerOrderByCreatedAtUtcDesc(traveler)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getTravelerBooking(String email, Long id) {
        Booking booking = bookingRepository.findByIdAndTravelerUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return mapToResponse(booking);
    }

    public List<GuideBookingResponse> getGuideBookings(String email) {
        GuideProfile guide = guideRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide profile not found"));
        return bookingRepository.findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(guide)
                .stream()
                .map(this::mapToGuideResponse)
                .collect(Collectors.toList());
    }

    public GuideBookingResponse getGuideBooking(String email, Long id) {
        Booking booking = bookingRepository.findByIdAndOccurrenceTemplateGuideUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return mapToGuideResponse(booking);
    }

    @Transactional
    public GuideBookingResponse confirmBooking(String email, Long id) {
        Booking booking = bookingRepository.findByIdAndOccurrenceTemplateGuideUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != Booking.Status.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is not pending guide confirmation");
        }

        TourOccurrence occurrence = booking.getOccurrence();
        int totalSeats = (occurrence.getSeatsReserved() != null ? occurrence.getSeatsReserved() : 0) + booking.getPeopleCount();
        if (totalSeats > occurrence.getTemplate().getMaxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot confirm: capacity reached");
        }

        booking.setStatus(Booking.Status.Confirmed);
        occurrence.setSeatsReserved(totalSeats);
        occurrenceRepository.save(occurrence);
        
        return mapToGuideResponse(bookingRepository.save(booking));
    }

    @Transactional
    public GuideBookingResponse rejectBooking(String email, Long id) {
        Booking booking = bookingRepository.findByIdAndOccurrenceTemplateGuideUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != Booking.Status.PendingGuide) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is not pending guide confirmation");
        }

        booking.setStatus(Booking.Status.Cancelled);
        booking.setCancellationReason("Rejected by Guide");
        booking.setCancelledAtUtc(Instant.now());
        
        return mapToGuideResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(String email, Long id) {
        Booking booking = bookingRepository.findByIdAndTravelerUserEmail(id, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() == Booking.Status.Cancelled || booking.getStatus() == Booking.Status.Completed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking cannot be cancelled");
        }

        Instant now = Instant.now();
        Instant startTime = booking.getOccurrence().getStartTimeUtc();
        long hoursUntilStart = Duration.between(now, startTime).toHours();

        if (hoursUntilStart > 48) {
            booking.setRefundPercent(BigDecimal.valueOf(100));
        } else if (hoursUntilStart >= 24) {
            booking.setRefundPercent(BigDecimal.valueOf(50));
        } else {
            booking.setRefundPercent(BigDecimal.ZERO);
        }

        if (booking.getStatus() == Booking.Status.Confirmed) {
            TourOccurrence occurrence = booking.getOccurrence();
            occurrence.setSeatsReserved(Math.max(0, (occurrence.getSeatsReserved() != null ? occurrence.getSeatsReserved() : 0) - booking.getPeopleCount()));
            occurrenceRepository.save(occurrence);
        }

        booking.setStatus(Booking.Status.Cancelled);
        booking.setCancelledAtUtc(now);
        booking.setCancellationReason("Cancelled by Traveler");

        return mapToResponse(bookingRepository.save(booking));
    }

    private BookingResponse mapToResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .occurrenceId(b.getOccurrence().getId())
                .tourTitle(b.getOccurrence().getTemplate().getTitle())
                .tourCoverImageUrl(null) // TODO: Implement media mapping if needed
                .startTimeUtc(b.getOccurrence().getStartTimeUtc())
                .endTimeUtc(b.getOccurrence().getEndTimeUtc())
                .meetingPointName(b.getOccurrence().getTemplate().getMeetingPointName())
                .status(b.getStatus().name())
                .bookingMode(b.getBookingMode())
                .peopleCount(b.getPeopleCount())
                .finalPrice(b.getFinalPrice())
                .currency(b.getCurrency())
                .qrCode(b.getQrCode())
                .cancellationReason(b.getCancellationReason())
                .refundPercent(b.getRefundPercent())
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
                .bookingMode(b.getBookingMode())
                .peopleCount(b.getPeopleCount())
                .finalPrice(b.getFinalPrice())
                .currency(b.getCurrency())
                .createdAtUtc(b.getCreatedAtUtc())
                .traveler(GuideBookingResponse.TravelerInfo.builder()
                        .id(b.getTraveler().getId())
                        .fullName(b.getTraveler().getUser().getFullName())
                        .email(b.getTraveler().getUser().getEmail())
                        .phoneE164(b.getTraveler().getUser().getPhoneE164())
                        .build())
                .build();
    }
}
