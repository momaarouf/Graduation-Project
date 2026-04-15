package com.travelmarket.backend.jobs;

import com.travelmarket.backend.booking.service.ReviewReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job that sends 24-hour post-trip review reminder emails.
 *
 * ── Why a dedicated job? ─────────────────────────────────────────────────────
 * The existing BookingStatusCleanupJob already runs every hour, but mixing
 * review-reminder concerns there would violate the Single Responsibility
 * Principle and make the cleanup job harder to reason about. A separate job
 * keeps the scheduler list self-documenting.
 *
 * ── Scheduling window ────────────────────────────────────────────────────────
 * fixedRate = 3 600 000 ms = 1 hour.
 *
 * The underlying repository query uses a 1-hour sliding window:
 *   windowStart = now - 25 hours
 *   windowEnd   = now - 24 hours
 *
 * This guarantees that every completed booking "falls into" the window
 * exactly once — no matter which hour the job fires relative to the
 * booking's completedAtUtc. The V58 partial index makes the scan
 * effectively free after the reminder has been sent.
 *
 * ── Safety ───────────────────────────────────────────────────────────────────
 * If the server restarts mid-run, the next startup will re-fire the job.
 * The DB-level reviewReminderSentAt stamp (written atomically per booking)
 * ensures that partly-processed batches are safe to re-run — already-stamped
 * bookings are excluded from the query.
 *
 * ── Demo / testing tip ───────────────────────────────────────────────────────
 * To trigger the job immediately without waiting an hour, temporarily lower
 * fixedRate to 10_000 (10 seconds). Remember to revert before committing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ReviewReminderJob {

    private final ReviewReminderService reviewReminderService;

    /**
     * Runs every 60 minutes to dispatch review reminder emails for bookings
     * completed ~24 hours ago.
     */
    @Scheduled(fixedRate = 3_600_000) // 1 hour
    public void sendReviewReminders() {
        log.debug("[ReviewReminderJob] Starting review reminder scan...");
        try {
            reviewReminderService.processReviewReminders();
        } catch (Exception e) {
            // Top-level catch: a transient DB or email error must never
            // kill the scheduler thread and prevent future runs.
            log.error("[ReviewReminderJob] Unexpected error during review reminder run", e);
        }
    }
}
