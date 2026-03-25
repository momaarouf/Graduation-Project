package com.travelmarket.backend.booking.repository;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.enums.BookingStatus;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.tour.entity.TourOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Booking persistence.
 *
 * Ownership rule enforced here:
 *   - Traveler queries always scope by traveler email via JOIN.
 *   - Guide queries always scope by the guide who owns the occurrence's template.
 *   - Admin queries (future card) would have no ownership filter.
 *
 * Soft-deleted bookings (deletedAtUtc IS NOT NULL) are intentionally included
 * in most queries so guides and travelers can see full history including
 * cancelled records.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ── Traveler queries ────────────────────────────────────────────────────

    /** All bookings for a traveler, newest first. Includes cancelled/completed. */
    List<Booking> findByTravelerOrderByCreatedAtUtcDesc(TravelerProfile traveler);

    /**
     * Single booking owned by the authenticated traveler (by email JOIN).
     * Used for detail view and cancellation — ownership enforced here.
     */
    Optional<Booking> findByIdAndTravelerUserEmail(Long id, String email);

    /**
     * Check for an existing active booking on the same occurrence.
     * Prevents duplicate bookings for the same traveler + occurrence pair.
     * excludedStatuses typically contains [Cancelled, Expired].
     */
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

    // ── Guide queries ───────────────────────────────────────────────────────

    /**
     * All bookings across all occurrences for tours owned by this guide.
     * Guide reaches their bookings through: guide → templates → occurrences → bookings.
     */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.occurrence.template.guide = :guide
            ORDER BY b.createdAtUtc DESC
            """)
    List<Booking> findByOccurrenceTemplateGuideOrderByCreatedAtUtcDesc(
            @Param("guide") GuideProfile guide);

    /**
     * Bookings for a specific occurrence owned by this guide.
     * Used on the guide's occurrence detail screen.
     */
    @Query("""
            SELECT b FROM Booking b
            WHERE b.occurrence = :occurrence
              AND b.occurrence.template.guide = :guide
            ORDER BY b.createdAtUtc DESC
            """)
    List<Booking> findByOccurrenceAndGuide(
            @Param("occurrence") TourOccurrence occurrence,
            @Param("guide") GuideProfile guide);

    /**
     * Single booking scoped to a guide's own tours — by database id.
     * Prevents guides from viewing or acting on other guides' bookings.
     */
    Optional<Booking> findByIdAndOccurrenceTemplateGuideUserEmail(Long id, String guideEmail);

    /**
     * Resolves a booking from the UUID QR token string, scoped to the guide's own tours.
     *
     * Used by the QR scanner check-in flow:
     *   1. Traveler's app displays a QR code encoding the qrCode UUID token.
     *   2. Guide's scanner app reads the token and sends it to
     *      POST /api/guide/bookings/checkin-by-qr/{qrToken}.
     *   3. This query validates the token belongs to one of the guide's own
     *      occurrences — cross-guide access is impossible by design.
     */
    Optional<Booking> findByQrCodeAndOccurrenceTemplateGuideUserEmail(
            String qrCode, String guideEmail);
}