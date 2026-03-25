package com.travelmarket.backend.service;

import com.travelmarket.backend.booking.dto.request.CreateBookingRequest;
import com.travelmarket.backend.booking.dto.request.JoinWaitlistRequest;
import com.travelmarket.backend.booking.dto.response.BookingResponse;
import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.entity.WaitlistEntry;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.booking.repository.WaitlistRepository;
import com.travelmarket.backend.booking.service.BookingService;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.enums.TourOccurrenceStatus;
import com.travelmarket.backend.tour.repository.TourOccurrenceRepository;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServicePromotionTest {

    @Autowired private BookingService bookingService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private WaitlistRepository waitlistRepository;
    @Autowired private TourOccurrenceRepository occurrenceRepository;
    @Autowired private TourTemplateRepository templateRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private TravelerProfileRepository travelerRepository;
    @Autowired private GuideProfileRepository guideRepository;

    private TravelerProfile travelerA;
    private TravelerProfile travelerB;
    private TravelerProfile travelerC;
    private TourOccurrence occurrence;

    @BeforeEach
    void setUp() {
        // Create common users
        travelerA = createTraveler("a@test.com");
        travelerB = createTraveler("b@test.com");
        travelerC = createTraveler("c@test.com");
        GuideProfile guide = createGuide("guide@test.com");

        // Create a Tour Template with max capacity 5
        TourTemplate template = new TourTemplate();
        template.setTitle("Test Tour");
        template.setGuide(guide);
        template.setMinCapacity(1);
        template.setMaxCapacity(5);
        template.setBasePrice(new BigDecimal("100.00"));
        template.setCurrency("USD");
        template.setInstantBook(true);
        template.setStatus(com.travelmarket.backend.tour.enums.TourTemplateStatus.PUBLISHED);
        template = templateRepository.save(template);

        // Create a Tour Occurrence
        occurrence = new TourOccurrence();
        occurrence.setTemplate(template);
        occurrence.setStartTimeUtc(Instant.now().plus(7, ChronoUnit.DAYS));
        occurrence.setEndTimeUtc(Instant.now().plus(7, ChronoUnit.DAYS).plus(4, ChronoUnit.HOURS));
        occurrence.setStatus(TourOccurrenceStatus.SCHEDULED);
        occurrence.setSeatsReserved(0);
        occurrence = occurrenceRepository.save(occurrence);
    }

    @Test
    void shouldPromoteTravelersInOrderWhenCapacityFreed() {
        // 1. Traveler A books all 5 seats
        CreateBookingRequest bookReq = new CreateBookingRequest();
        bookReq.setOccurrenceId(occurrence.getId());
        bookReq.setPeopleCount(5);
        bookReq.setWaiverSigned(true);
        BookingResponse bookingA = bookingService.createBooking(travelerA.getUser().getEmail(), bookReq);

        assertThat(occurrenceRepository.findById(occurrence.getId()).get().getSeatsReserved()).isEqualTo(5);
        assertThat(occurrenceRepository.findById(occurrence.getId()).get().getStatus()).isEqualTo(TourOccurrenceStatus.FULL);

        // 2. Traveler B joins waitlist for 3 seats
        JoinWaitlistRequest waitReqB = new JoinWaitlistRequest();
        waitReqB.setOccurrenceId(occurrence.getId());
        waitReqB.setPeopleCount(3);
        bookingService.joinWaitlist(travelerB.getUser().getEmail(), waitReqB);

        // 3. Traveler C joins waitlist for 2 seats
        JoinWaitlistRequest waitReqC = new JoinWaitlistRequest();
        waitReqC.setOccurrenceId(occurrence.getId());
        waitReqC.setPeopleCount(2);
        bookingService.joinWaitlist(travelerC.getUser().getEmail(), waitReqC);

        // 4. Traveler A cancels their booking
        bookingService.cancelBooking(travelerA.getUser().getEmail(), bookingA.getId(), null);

        // 5. Verify both B and C are promoted
        List<Booking> activeBookings = bookingRepository.findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(occurrence.getTemplate().getGuide());
        
        // Should find bookings for B and C (A is cancelled)
        assertThat(activeBookings).anyMatch(b -> b.getTraveler().getId().equals(travelerB.getId()) && b.getStatus() == BookingStatus.Confirmed);
        assertThat(activeBookings).anyMatch(b -> b.getTraveler().getId().equals(travelerC.getId()) && b.getStatus() == BookingStatus.Confirmed);
        
        TourOccurrence updatedOcc = occurrenceRepository.findById(occurrence.getId()).get();
        assertThat(updatedOcc.getSeatsReserved()).isEqualTo(5);
        assertThat(updatedOcc.getStatus()).isEqualTo(TourOccurrenceStatus.FULL);
        assertThat(updatedOcc.getWaitlistCount()).isEqualTo(0);
    }

    @Test
    void shouldSkipWaitlistEntryIfGroupSizeCannotFit() {
        // 1. Traveler A books 4 seats (1 left)
        CreateBookingRequest bookReq1 = new CreateBookingRequest();
        bookReq1.setOccurrenceId(occurrence.getId());
        bookReq1.setPeopleCount(4);
        bookReq1.setWaiverSigned(true);
        bookingService.createBooking(travelerA.getUser().getEmail(), bookReq1);

        // 2. Fill the last seat with another traveler so we can join waitlist
        User tempUser = new User();
        tempUser.setEmail("temp@test.com");
        tempUser.setRole(User.Role.Traveler);
        tempUser.setPasswordHash("hashed");
        userRepository.save(tempUser);
        TravelerProfile tempTraveler = new TravelerProfile();
        tempTraveler.setUser(tempUser);
        travelerRepository.save(tempTraveler);

        CreateBookingRequest bookReq2 = new CreateBookingRequest();
        bookReq2.setOccurrenceId(occurrence.getId());
        bookReq2.setPeopleCount(1);
        bookReq2.setWaiverSigned(true);
        BookingResponse bookingTemp = bookingService.createBooking("temp@test.com", bookReq2);

        // Tour is now FULL (5/5)
        assertThat(occurrenceRepository.findById(occurrence.getId()).get().getStatus()).isEqualTo(TourOccurrenceStatus.FULL);

        // 3. Traveler B (pos 1) joins waitlist for 5 seats (impossible to fit if only 1 seat released)
        JoinWaitlistRequest waitReqB = new JoinWaitlistRequest();
        waitReqB.setOccurrenceId(occurrence.getId());
        waitReqB.setPeopleCount(5);
        bookingService.joinWaitlist(travelerB.getUser().getEmail(), waitReqB);

        // 4. Traveler C (pos 2) joins waitlist for 1 seat (CAN fit if 1 seat released)
        JoinWaitlistRequest waitReqC = new JoinWaitlistRequest();
        waitReqC.setOccurrenceId(occurrence.getId());
        waitReqC.setPeopleCount(1);
        bookingService.joinWaitlist(travelerC.getUser().getEmail(), waitReqC);

        // 5. Cancel the 1-seat booking
        bookingService.cancelBooking("temp@test.com", bookingTemp.getId(), null);

        // 6. Verify C is promoted even though B was first, because only 1 seat was available
        List<Booking> activeBookings = bookingRepository.findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(occurrence.getTemplate().getGuide());
        assertThat(activeBookings).anyMatch(b -> b.getTraveler().getId().equals(travelerC.getId()) && b.getStatus() == BookingStatus.Confirmed);
        assertThat(activeBookings).noneMatch(b -> b.getTraveler().getId().equals(travelerB.getId())); // B still on waitlist

        TourOccurrence updatedOcc = occurrenceRepository.findById(occurrence.getId()).get();
        assertThat(updatedOcc.getSeatsReserved()).isEqualTo(5); // 4 (A) + 1 (C)
        assertThat(updatedOcc.getStatus()).isEqualTo(TourOccurrenceStatus.FULL);
        assertThat(updatedOcc.getWaitlistCount()).isEqualTo(1); // B is still there
    }

    @Test
    void shouldSnapshotPlatformFeeOnBookingCreation() {
        CreateBookingRequest bookReq = new CreateBookingRequest();
        bookReq.setOccurrenceId(occurrence.getId());
        bookReq.setPeopleCount(2);
        bookReq.setWaiverSigned(true);
        
        BookingResponse response = bookingService.createBooking(travelerA.getUser().getEmail(), bookReq);
        
        Booking booking = bookingRepository.findById(response.getId()).get();
        // 2 people * 100.00 = 200.00 finalPrice. Platform fee is 10% = 20.00.
        assertThat(booking.getPlatformFeeSnapshot()).isEqualByComparingTo(new BigDecimal("20.00"));
    }

    private TravelerProfile createTraveler(String email) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test Traveler");
        user.setRole(User.Role.Traveler);
        user.setPasswordHash("hashed");
        user = userRepository.save(user);
        TravelerProfile profile = new TravelerProfile();
        profile.setUser(user);
        return travelerRepository.save(profile);
    }

    private GuideProfile createGuide(String email) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test Guide");
        user.setRole(User.Role.Guide);
        user.setPasswordHash("hashed");
        user = userRepository.save(user);
        GuideProfile profile = new GuideProfile();
        profile.setUser(user);
        return guideRepository.save(profile);
    }
}
