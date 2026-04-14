package com.travelmarket.backend.jobs;

import com.travelmarket.backend.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background job that expires PendingPayment bookings whose 15-minute
 * payment window has lapsed.
 *
 * ── Why a separate job? ───────────────────────────────────────────────────────
 * The existing BookingStatusCleanupJob runs every HOUR, which is far too slow
 * for a 15-minute payment window. Rather than changing the cleanup job's
 * frequency (which could increase load from the InProgress/Confirmed checks),
 * we keep the concerns separate with a dedicated fast-running job here.
 *
 * ── Safety ───────────────────────────────────────────────────────────────────
 * If a traveler completes payment at the same instant the scheduler fires:
 *   - StripePaymentService confirms the booking → status flips to Confirmed.
 *   - BookingService.findStalePendingPaymentBookings() only matches PendingPayment.
 *   - Even in an extreme race, @Version on Booking provides optimistic locking;
 *     the slower writer gets an OptimisticLockException, which is caught and
 *     logged in processExpiredPendingPayments() without cascading failures.
 *
 * ── Configuration ────────────────────────────────────────────────────────────
 * fixedRate = 60_000 ms = 1 minute.
 * In demo mode you can temporarily lower to 10_000 (10 s) to observe fast expiry.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentTimeoutJob {

    private final BookingService bookingService;

    /**
     * Runs every 60 seconds to expire PendingPayment bookings past their deadline.
     *
     * If no expired bookings exist, BookingService returns early without logging,
     * so the console stays clean under normal operation.
     */
    @Scheduled(fixedRate = 60_000) // 60 seconds
    public void expireUnpaidBookings() {
        log.debug("[PaymentTimeoutJob] Running payment timeout check...");
        try {
            bookingService.processExpiredPendingPayments();
        } catch (Exception e) {
            // Top-level catch so a transient DB error doesn't kill the scheduler thread.
            log.error("[PaymentTimeoutJob] Unexpected error during payment timeout cleanup", e);
        }
    }
}
