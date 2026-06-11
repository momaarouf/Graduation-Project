# Review Reminder Service

**Service:** `ReviewReminderService` + `ReviewReminderJob`
**Module:** `backend/booking/service/`, `backend/jobs/`
**Added in:** V58 Flyway migration

---

## Overview

After a traveler's trip is completed, the system automatically sends:

1. **A branded HTML email** (via Brevo HTTP REST API / `EmailService.sendHtml()`) with a CTA to leave a review
2. **An in-app notification** (type `REVIEW_REMINDER`) pushed over WebSocket to the notification bell

The reminder fires **exactly 24 hours after `booking.completedAtUtc`** and is sent **exactly once**, guaranteed by a `reviewReminderSentAt` timestamp stamped atomically on the `Booking` row.

---

## Flow Diagram

```
Every 1 hour
     │
     ▼
ReviewReminderJob.sendReviewReminders()
     │
     ▼
ReviewReminderService.processReviewReminders()
     │
     ├─ Build time window: [now-25h, now-24h]
     │
     ├─ BookingRepository.findCompletedBookingsEligibleForReminder(windowStart, windowEnd)
     │    Filters: status=Completed, completedAtUtc in window,
     │             reviewReminderSentAt IS NULL, 
     │             deletedAtUtc IS NULL,
     │             traveler.reviewReminderEnabled = true
     │
     ├─ For each eligible booking:
     │    │
     │    ├─ ReviewRepository.existsByBookingId() → already reviewed?
     │    │    YES → stamp reviewReminderSentAt, skip email
     │    │    NO  → continue
     │    │
     │    ├─ EmailService.sendHtml()     ← branded HTML email (async)
     │    │
     │    ├─ NotificationService.createNotificationInAppOnly()  ← WebSocket bell (async)
     │    │
     │    └─ Booking.reviewReminderSentAt = now()  ← stamped last (retry safety)
     │
     └─ Log summary: sent=N, skipped=M
```

---

## Scheduler Logic

| Property | Value |
|---|---|
| Class | `ReviewReminderJob` |
| Annotation | `@Scheduled(fixedRate = 3_600_000)` |
| Frequency | Every **1 hour** |
| Window queried | Bookings completed between `now - 25h` and `now - 24h` |
| Why a 1-hour window? | Matches `fixedRate` exactly — no booking ever slips through or is double-queried |

> **Demo / testing:** Temporarily set `fixedRate = 10_000` to trigger the job in 10 seconds during development. Revert before committing.

---

## Conditions for Sending

A reminder email is sent **only if ALL** of the following are true:

| Condition | Where enforced |
|---|---|
| `booking.status == Completed` | DB query |
| `booking.completedAtUtc` is 24–25 hours ago | DB query (sliding window) |
| `booking.reviewReminderSentAt IS NULL` | DB query + partial index |
| `booking.deletedAtUtc IS NULL` | DB query |
| `traveler.reviewReminderEnabled == true` | DB query |
| No existing non-deleted review for this booking | `ReviewRepository.existsByBookingId()` in service |

---

## Anti-Duplication Strategy (Layered Defence)

| Layer | Mechanism |
|---|---|
| **L1 — DB query** | `WHERE review_reminder_sent_at IS NULL` — rows with a stamp are never returned |
| **L2 — Review check** | `ReviewRepository.existsByBookingId()` — skips if traveler already reviewed |
| **L3 — Atomic stamp** | `@Transactional` method stamps `reviewReminderSentAt` immediately after dispatch |
| **L4 — Partial index** | V58 partial index on `(completed_at_utc) WHERE review_reminder_sent_at IS NULL` makes L1 O(1) after send |

Even if the server crashes mid-batch, partially processed bookings are safe:
- Bookings where the email was sent and the stamp was committed → excluded from next run ✅
- Bookings where the send failed (exception caught) → stamp NOT written → retried next hour ✅

---

## Database Changes (V58)

```sql
-- New column
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS review_reminder_sent_at TIMESTAMPTZ;

-- Partial index — only un-sent rows are ever scanned
CREATE INDEX IF NOT EXISTS idx_bookings_review_reminder_pending
    ON bookings (completed_at_utc)
    WHERE review_reminder_sent_at IS NULL;
```

---

## Email Template

- **Subject:** `How was your trip? Leave a review for "<Tour Name>"`
- **Header color:** Brand blue gradient `#1d4ed8 → #3b82f6`
- **CTA button:** Gold gradient `#f59e0b → #d97706`
- **CTA link:** `{app.frontend.base-url}/dashboard/traveler/bookings/{bookingId}/review`
- **Footer:** Unsubscribe link → traveler notification settings
- **HTML safety:** Names/titles are HTML-escaped before injection

---

## In-App Notification

| Property | Value |
|---|---|
| `type` | `REVIEW_REMINDER` |
| `title` | `"How was your trip? ⭐"` |
| `message` | `"You recently completed "{Tour Name}". Share your experience!"` |
| `referenceId` | Booking ID (string) |
| `referenceType` | `"BOOKING"` |
| Delivery | WebSocket push + persisted in `notifications` table |

> **Why `createNotificationInAppOnly()`?** The existing `createNotification()` method also sends an email (for chat messages). Since `ReviewReminderService` already sends its own richer branded email, a separate in-app-only variant was added to `NotificationService` to avoid a duplicate plain-text email.

---

## Files Changed

| File | Type | Purpose |
|---|---|---|
| `V58__add_booking_review_reminder_sent_at.sql` | NEW | DB column + partial index |
| `Booking.java` | MODIFIED | `reviewReminderSentAt` field |
| `NotificationType.java` | MODIFIED | `REVIEW_REMINDER` enum value |
| `BookingRepository.java` | MODIFIED | `findCompletedBookingsEligibleForReminder()` |
| `ReviewReminderService.java` | NEW | Core batch logic |
| `ReviewReminderJob.java` | NEW | `@Scheduled` wrapper |
| `NotificationService.java` | MODIFIED | `createNotificationInAppOnly()` variant |

---

## Testing Guide

### Postman / Manual Test Sequence

1. **Complete a booking** via the guide QR flow (or directly set `status = 'Completed'` in DB)

2. **Simulate 24h passing:**
   ```sql
   UPDATE bookings
   SET completed_at_utc = NOW() - INTERVAL '24 hours 30 minutes'
   WHERE id = <your_booking_id>;
   ```

3. **Speed up the job** (temporarily in `ReviewReminderJob.java`):
   ```java
   @Scheduled(fixedRate = 10_000) // 10 seconds — REVERT BEFORE COMMIT
   ```

4. **Restart the backend** → watch IntelliJ console for:
   ```
   [ReviewReminderService] Processing 1 review reminder(s) for window [...]
   [ReviewReminderService] Review reminder email queued → user@example.com (bookingId=42)
   [ReviewReminderService] Done. sent=1, skipped(already reviewed)=0
   ```

5. **Verify email** in Brevo dashboard (Logs → Transactional → filter by email)

6. **Verify notification** via `GET /api/notifications` — should contain a `REVIEW_REMINDER` entry

7. **Idempotency test:** run job again (without changing DB) → sent=0, skipped=0

8. **Already-reviewed test:**
   - Submit a review for the booking
   - Reset: `UPDATE bookings SET review_reminder_sent_at = NULL WHERE id = <id>;`  
   - Run job → should log `skipped=1`, no email sent

9. **Opt-out test:**
   - `UPDATE traveler_profiles SET review_reminder_enabled = false WHERE id = <id>;`
   - Reset `review_reminder_sent_at = NULL`
   - Run job → booking excluded from query entirely

### Test Case Matrix

| Scenario | Expected Result |
|---|---|
| Completed booking, 24h elapsed, no review | ✅ Email sent, notification created, stamp set |
| Run job a second time on same booking | ✅ No action (stamp already set) |
| Booking already has a review | ✅ Stamp set, no email |
| `reviewReminderEnabled = false` | ✅ Excluded from DB query |
| Booking status = Cancelled | ✅ Excluded from DB query |
| Booking not yet 24h old | ✅ Excluded from DB query (outside window) |
| Email send throws exception | ✅ Booking NOT stamped → retried next hour |
