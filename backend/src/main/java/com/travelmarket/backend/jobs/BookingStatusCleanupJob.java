package com.travelmarket.backend.jobs;

import com.travelmarket.backend.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background job to automatically synchronize booking statuses globally.
 * Complements the 'lazy sync' in BookingService by processing bookings
 * for users who are not currently active.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingStatusCleanupJob {

    private final BookingService bookingService;

    /**
     * Runs every hour to transition stale 'InProgress' bookings to 'Completed'
     * and 'Confirmed' bookings to 'Cancelled' (No-Show).
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupStaleBookings() {
        log.info("Starting scheduled BookingStatusCleanupJob...");
        try {
            bookingService.processStaleBookings();
            log.info("BookingStatusCleanupJob completed successfully.");
        } catch (Exception e) {
            log.error("Error during BookingStatusCleanupJob execution", e);
        }
    }
}
