package com.travelmarket.backend.booking.repository;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Booking persistence.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── Traveler queries ────────────────────────────────────────────────────

    List<Booking> findByTravelerOrderByCreatedAtUtcDesc(TravelerProfile traveler);

    Optional<Booking> findByIdAndTravelerUserEmail(Long id, String email);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.traveler = :traveler
              AND b.occurrence = :occurrence
              AND b.status NOT IN :excludedStatuses
              AND b.deletedAtUtc IS NULL
            """)
    Optional<Booking> findActiveBookingForOccurrence(
            @Param("traveler") TravelerProfile traveler,
            @Param("occurrence") TourOccurrence occurrence,
            @Param("excludedStatuses") List<BookingStatus> excludedStatuses
    );

    @Query("""
            SELECT b FROM Booking b
            WHERE b.traveler.user.email = :email
              AND b.occurrence.template.id = :templateId
              AND b.status NOT IN :excludedStatuses
              AND b.deletedAtUtc IS NULL
            """)
    List<Booking> findActiveByTravelerAndTemplate(
            @Param("email") String email,
            @Param("templateId") Long templateId,
            @Param("excludedStatuses") List<BookingStatus> excludedStatuses
    );

    // ── Guide queries ───────────────────────────────────────────────────────

    @Query("""
            SELECT b FROM Booking b
            WHERE b.occurrence.template.guide = :guide
            ORDER BY b.createdAtUtc DESC
            """)
    List<Booking> findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(
            @Param("guide") GuideProfile guide);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.occurrence = :occurrence
              AND b.occurrence.template.guide = :guide
            ORDER BY b.createdAtUtc DESC
            """)
    List<Booking> findByOccurrenceAndGuide(
            @Param("occurrence") TourOccurrence occurrence,
            @Param("guide") GuideProfile guide);

    Optional<Booking> findByIdAndOccurrenceTemplateGuideUserEmail(Long id, String guideEmail);

    Optional<Booking> findByQrCodeAndOccurrenceTemplateGuideUserEmail(
            String qrCode, String guideEmail);

    // ── Maintenance queries ─────────────────────────────────────────────────

    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.travelmarket.backend.booking.enums.BookingStatus.InProgress
              AND b.occurrence.endTimeUtc < :cutoff
              AND b.deletedAtUtc IS NULL
            """)
    List<Booking> findStaleInProgressBookings(@Param("cutoff") Instant cutoff);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.travelmarket.backend.booking.enums.BookingStatus.Confirmed
              AND b.occurrence.startTimeUtc < :cutoff
              AND b.deletedAtUtc IS NULL
            """)
    List<Booking> findStaleConfirmedBookings(@Param("cutoff") Instant cutoff);

    /**
     * Finds PendingPayment bookings whose 30-minute cart window has expired.
     * Safety net alongside Stripe's checkout.session.expired webhook.
     * cartExpiresAtUtc is set by StripePaymentService.createCheckoutSession().
     */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.travelmarket.backend.booking.enums.BookingStatus.PendingPayment
              AND b.cartExpiresAtUtc IS NOT NULL
              AND b.cartExpiresAtUtc < :now
              AND b.deletedAtUtc IS NULL
            """)
    List<Booking> findStalePendingPaymentBookings(@Param("now") Instant now);
}