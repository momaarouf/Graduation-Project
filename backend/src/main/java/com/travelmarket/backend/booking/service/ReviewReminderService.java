package com.travelmarket.backend.booking.service;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.review.repository.ReviewRepository;
import com.travelmarket.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * ReviewReminderService — sends one-time post-trip review reminders.
 *
 * ── When it runs ────────────────────────────────────────────────────────────
 * Called hourly by ReviewReminderJob.
 * Processes bookings whose completedAtUtc falls in the 24–25 hour window
 * behind the current UTC clock, matching the job's 1-hour fixedRate.
 *
 * ── Anti-duplication guarantees (layered defence) ───────────────────────────
 * 1. DB query: WHERE review_reminder_sent_at IS NULL
 *    → the partial index (V58) makes this O(1) once sent
 * 2. ReviewRepository.existsByBookingId(): skip if traveler already reviewed
 * 3. reviewReminderSentAt stamp: written immediately after dispatch inside
 *    a single @Transactional method — prevents re-processing on re-runs
 *
 * ── Failure isolation ───────────────────────────────────────────────────────
 * Each booking is processed in its own try-catch. A single transient email
 * failure never aborts the rest of the batch. The booking is NOT stamped if
 * an exception is thrown, so it will be retried on the next hourly run.
 *
 * ── User opt-out ────────────────────────────────────────────────────────────
 * TravelerProfile.reviewReminderEnabled = false → filtered out at query level,
 * so no processing cost is incurred for opted-out users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewReminderService {

    private final BookingRepository    bookingRepository;
    private final ReviewRepository     reviewRepository;
    private final EmailService         emailService;
    private final NotificationService  notificationService;

    // Injected from application.properties — e.g. "http://localhost:3000"
    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    // ── Public API (called by ReviewReminderJob) ─────────────────────────────

    /**
     * Scans the 24–25-hour completion window and sends reminders for all
     * eligible bookings. Each booking's processing is isolated; one failure
     * never blocks the rest of the batch.
     */
    public void processReviewReminders() {

        // Define the 1-hour sliding window: bookings completed 24–25 hours ago
        Instant now         = Instant.now();
        Instant windowEnd   = now.minus(24, ChronoUnit.HOURS); // = 24 h ago
        Instant windowStart = now.minus(25, ChronoUnit.HOURS); // = 25 h ago

        // Single query — JOIN FETCH pulls traveler+user+occurrence+template in one round-trip
        List<Booking> eligible = bookingRepository
                .findCompletedBookingsEligibleForReminder(windowStart, windowEnd);

        if (eligible.isEmpty()) {
            // Silent return — keeps log clean when nothing needs processing
            log.debug("[ReviewReminderService] No eligible bookings found in window [{} – {}]",
                    windowStart, windowEnd);
            return;
        }

        log.info("[ReviewReminderService] Processing {} review reminder(s) for window [{} – {}]",
                eligible.size(), windowStart, windowEnd);

        int sent   = 0;
        int skipped = 0;

        for (Booking booking : eligible) {
            try {
                boolean dispatched = processOneBooking(booking);
                if (dispatched) sent++; else skipped++;
            } catch (Exception e) {
                // Isolate per-booking failures — do NOT stamp reviewReminderSentAt
                // so the next hourly run will retry this booking
                log.error("[ReviewReminderService] Failed to process reminder for bookingId={}: {}",
                        booking.getId(), e.getMessage(), e);
            }
        }

        log.info("[ReviewReminderService] Done. sent={}, skipped(already reviewed)={}", sent, skipped);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Processes a single booking:
     *   1. Skip if traveler has already submitted a review (idempotency guard).
     *   2. Send the HTML reminder email directly via EmailService.
     *   3. Create an in-app notification via NotificationService.
     *   4. Stamp reviewReminderSentAt so this booking is never processed again.
     *
     * @return true if the reminder was sent, false if skipped (already reviewed)
     */
    @Transactional
    protected boolean processOneBooking(Booking booking) {

        // ── Guard: traveler already submitted a review ───────────────────────
        // ReviewRepository.existsByBookingId() checks deletedAtUtc IS NULL,
        // so soft-deleted reviews do NOT count (allows re-submission after admin purge).
        if (reviewRepository.existsByBookingId(booking.getId())) {
            log.debug("[ReviewReminderService] Booking {} already has a review — skipping reminder",
                    booking.getId());
            // Stamp the field anyway so we don't re-query this booking next hour
            stampReminderSent(booking);
            return false;
        }

        // ── Gather display data from eager-loaded graph ──────────────────────
        String travelerEmail    = booking.getTraveler().getUser().getEmail();
        String travelerName     = booking.getTraveler().getUser().getFullName();
        Long   travelerUserId   = booking.getTraveler().getUser().getId();
        String tourTitle        = booking.getOccurrence().getTemplate().getTitle();
        Long   bookingId        = booking.getId();

        // CTA deep-link in the email and notification
        String reviewUrl = String.format("%s/dashboard/traveler/bookings/%d/review",
                frontendBaseUrl, bookingId);

        // ── Step 1: Send the branded HTML email ─────────────────────────────
        String subject  = "How was your trip? Leave a review for \"" + tourTitle + "\"";
        String htmlBody = buildReminderEmailHtml(travelerName, tourTitle, reviewUrl, bookingId);

        // EmailService.sendHtml() is @Async — returns immediately, sends in background
        emailService.sendHtml(travelerEmail, subject, htmlBody);
        log.info("[ReviewReminderService] Review reminder email queued → {} (bookingId={})",
                travelerEmail, bookingId);

        // ── Step 2: Create in-app notification ──────────────────────────────
        // NotificationService.createNotification() is @Async — non-blocking.
        // We pass the bookingId as referenceId so the frontend can deep-link.
        notificationService.createNotificationInAppOnly(
                travelerUserId,
                NotificationType.REVIEW_REMINDER,
                "How was your trip? ⭐",
                "You recently completed \"" + tourTitle + "\". Share your experience!",
                String.valueOf(bookingId),
                "BOOKING"
        );

        // ── Step 3: Stamp processed — MUST be last to preserve retry-on-failure ──
        stampReminderSent(booking);

        return true;
    }

    /**
     * Marks the booking as having had its reminder sent.
     * Saved within the outer @Transactional scope so it commits atomically
     * with the entity state changes.
     */
    private void stampReminderSent(Booking booking) {
        booking.setReviewReminderSentAt(Instant.now());
        bookingRepository.save(booking);
    }

    /**
     * Builds the HTML body for the review reminder email.
     *
     * Design decisions:
     *  - Inline styles only — maximum email-client compatibility (no external CSS)
     *  - Brand colors: #2563eb (blue trust) + #f59e0b (gold/CTA adventure)
     *  - Star emoji in subject + greeting for warmth without image attachments
     *  - Unsubscribe note at bottom (legal best practice; full unsubscribe page is future work)
     */
    private String buildReminderEmailHtml(String travelerName,
                                          String tourTitle,
                                          String reviewUrl,
                                          Long   bookingId) {
        return "<!DOCTYPE html>" +
               "<html lang='en'>" +
               "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
               "<body style='margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;'>" +

               // ── Outer wrapper ──────────────────────────────────────────────
               "<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f8fafc;padding:40px 20px;'>" +
               "<tr><td align='center'>" +
               "<table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;" +
               "box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;max-width:100%;'>" +

               // ── Header band ────────────────────────────────────────────────
               "<tr><td style='background:linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#3b82f6 100%);" +
               "padding:36px 40px;text-align:center;'>" +
               "<div style='font-size:40px;margin-bottom:8px;'>⭐</div>" +
               "<h1 style='color:#ffffff;margin:0;font-size:22px;font-weight:700;line-height:1.3;'>" +
               "How was your experience?</h1>" +
               "<p style='color:#bfdbfe;margin:8px 0 0;font-size:14px;'>Your feedback helps other travellers decide</p>" +
               "</td></tr>" +

               // ── Body content ───────────────────────────────────────────────
               "<tr><td style='padding:36px 40px;'>" +
               "<p style='color:#374151;font-size:16px;margin:0 0 16px;'>Hi <strong>" + escapeHtml(travelerName) + "</strong>,</p>" +
               "<p style='color:#374151;font-size:16px;margin:0 0 24px;line-height:1.6;'>" +
               "It's been 24 hours since you completed your trip on" +
               " <strong style='color:#1d4ed8;'>" + escapeHtml(tourTitle) + "</strong>. " +
               "We'd love to hear what you thought!</p>" +

               // ── Star row (decorative) ──────────────────────────────────────
               "<div style='text-align:center;margin:0 0 28px;font-size:28px;letter-spacing:4px;'>" +
               "★ ★ ★ ★ ★</div>" +

               "<p style='color:#6b7280;font-size:14px;margin:0 0 28px;line-height:1.6;'>" +
               "Your honest review helps guide future travellers and supports your guide's work. " +
               "It only takes 2 minutes.</p>" +

               // ── CTA button ─────────────────────────────────────────────────
               "<div style='text-align:center;margin:0 0 32px;'>" +
               "<a href='" + reviewUrl + "' " +
               "style='display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);" +
               "color:#ffffff;font-size:16px;font-weight:700;padding:14px 36px;" +
               "border-radius:8px;text-decoration:none;letter-spacing:0.3px;" +
               "box-shadow:0 4px 15px rgba(245,158,11,0.4);'>" +
               "⭐ Leave a Review</a>" +
               "</div>" +

               // ── Divider ────────────────────────────────────────────────────
               "<hr style='border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;'/>" +

               // ── Booking reference ──────────────────────────────────────────
               "<p style='color:#9ca3af;font-size:12px;margin:0;text-align:center;'>" +
               "Booking reference: #" + bookingId + " &nbsp;|&nbsp; " +
               "<a href='" + reviewUrl + "' style='color:#2563eb;text-decoration:none;'>Open in browser</a>" +
               "</p>" +
               "</td></tr>" +

               // ── Footer ─────────────────────────────────────────────────────
               "<tr><td style='background:#f1f5f9;padding:20px 40px;text-align:center;'>" +
               "<p style='color:#9ca3af;font-size:12px;margin:0;line-height:1.6;'>" +
               "You're receiving this because you completed a booking on Travel Marketplace.<br/>" +
               "To stop receiving review reminders, update your " +
               "<a href='" + frontendBaseUrl + "/dashboard/traveler/settings' " +
               "style='color:#2563eb;text-decoration:none;'>notification preferences</a>." +
               "</p>" +
               "</td></tr>" +

               "</table>" + // inner card
               "</td></tr>" +
               "</table>" + // outer wrapper
               "</body></html>";
    }

    /**
     * Minimal HTML escaping to prevent XSS in the email body.
     * Only &, <, > need escaping in HTML text content.
     */
    private String escapeHtml(String input) {
        if (input == null) return "";
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
