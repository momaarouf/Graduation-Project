# Booking Payment Timeout System

## Overview

When a traveler creates a booking for an **Instant Book** tour, seats are immediately reserved but payment has not yet been collected. To prevent travelers from blocking availability indefinitely without paying, the system automatically cancels unpaid bookings after **15 minutes**.

---

## Booking Lifecycle States

```
CREATE BOOKING
     │
     ├─ Instant Book ──→ PendingPayment  ──────────────────────┐
     │                        │                                │
     │                        │ Payment success                │ 15-min deadline passes
     │                        ↓                                │ (PaymentTimeoutJob)
     │                    Confirmed ──→ InProgress ──→ Completed│
     │                        │                               │
     │                        │ Traveler/Guide cancels        ↓
     │                        ↓                           Expired
     │                    Cancelled                       │
     │                                                    │ seats released
     └─ Request to Book ──→ PendingGuide                  │ waitlist promoted
                                │                         │ notifications sent
                                │ Guide accepts
                                ↓
                            Confirmed (→ same path as above)
                                │
                                │ Guide rejects / 24h timeout
                                ↓
                            Cancelled
```

---

## Timeout Flow

### Step 1 — Booking Creation (`BookingService.createBooking`)

When an Instant Book booking is created, the payment deadline is immediately set:

```java
booking.setStatus(BookingStatus.PendingPayment);
booking.setCartExpiresAtUtc(Instant.now().plus(15, ChronoUnit.MINUTES));
```

The 15-minute clock starts **at booking creation**, not when the traveler opens the payment page. This is the authoritative timeout anchor.

### Step 2 — Scheduler (`PaymentTimeoutJob`)

A dedicated Spring `@Scheduled` job runs **every 60 seconds**:

```
PaymentTimeoutJob.expireUnpaidBookings()
  └── BookingService.processExpiredPendingPayments()
        └── BookingRepository.findStalePendingPaymentBookings(now)
              → Returns all PendingPayment bookings where cartExpiresAtUtc < now
```

### Step 3 — Expiry Processing (`BookingService.processExpiredPendingPayments`)

For each expired booking:
1. Status: `PendingPayment` → `Expired`
2. `cancelledAtUtc` = now, `cancellationReason` = "Payment not completed within 15-minute window"
3. Seats released via `releaseSeats()`
4. Waitlist promoted via `promoteFromWaitlist()`
5. **Traveler** notified: `BOOKING_EXPIRED`
6. **Guide** notified: `BOOKING_CANCELLED` ("A booking was cancelled — no payment received")

### Step 4 — Payment Confirmation (`StripePaymentService`)

When payment succeeds (webhook or mock-confirm):
- Status: `PendingPayment` → `Confirmed`
- `cartExpiresAtUtc` is cleared to null
- This **prevents the scheduler from expiring an already-paid booking** (query only matches `PendingPayment`)

---

## Race Condition Handling

| Scenario | What Happens |
|---|---|
| Payment confirmed just as scheduler fires | Status is now `Confirmed` → query doesn't match → no expiry |
| Scheduler and webhook fire simultaneously | `@Version` (JPA optimistic locking) ensures only one writer wins. Loser gets `OptimisticLockException`, caught and logged. Booking remains in correct state. |
| Multiple expired bookings | All processed in a loop, each saved individually. One failure doesn't block others. |
| Booking with no payment session ever created | `cartExpiresAtUtc` is set at creation → scheduler still expires it correctly |

---

## Frontend Countdown Timer

The `BookingResponse` now includes `paymentDeadlineUtc` (ISO 8601 UTC) when status is `PendingPayment`.

### Components

- **`/src/hooks/usePaymentCountdown.ts`** — React hook that ticks every second and computes `{ minutesLeft, secondsLeft, isExpired, displayString, urgency }`
- **`/src/components/booking/PaymentCountdownBanner.tsx`** — Visual banner component with three urgency levels:

| Time Remaining | Urgency | UI |
|---|---|---|
| > 5 minutes | `normal` | Amber banner, static clock icon |
| ≤ 5 minutes | `warning` | Orange banner, pulsing warning icon |
| ≤ 2 minutes | `critical` | Red banner, bouncing icon, pulsing timer |
| Expired | — | Red "Booking Expired" message |

### Expiry Callback

When the countdown reaches zero, `onExpired` is called which re-fetches the booking from the API. This ensures the UI reflects the backend's `Expired` status (set by the scheduler) and removes the payment form.

---

## Database

### `bookings.cart_expires_at_utc`

Already existed (added in V38). Now populated **at booking creation** (15 min window) instead of only when a Stripe session is created.

### Index (V53)

```sql
CREATE INDEX IF NOT EXISTS idx_bookings_pending_payment_deadline
    ON bookings (cart_expires_at_utc)
    WHERE status = 'PendingPayment' AND deleted_at_utc IS NULL;
```

This partial index makes the per-minute scheduler query efficient — only scans the small set of active `PendingPayment` rows.

---

## Testing

### Postman: Full Timeout Flow

1. **Create Booking** — `POST /api/traveler/bookings` with an Instant Book tour occurrence
   - Response should include `paymentDeadlineUtc` = ~15 min from now and `status = "PendingPayment"`

2. **Simulate Expiry** (without waiting 15 min):
   ```sql
   UPDATE bookings SET cart_expires_at_utc = NOW() - INTERVAL '1 minute' WHERE id = <bookingId>;
   ```
   Then wait ≤60 seconds for the scheduler to run.

3. **Verify Cancellation** — `GET /api/traveler/bookings/<bookingId>`
   - `status` should be `"Expired"`
   - `cancellationReason` = "Payment not completed within 15-minute window"

4. **Verify Notification** — check the `notifications` table for a row with `type = 'BOOKING_EXPIRED'` targeting the traveler

5. **Verify Seat Released** — `GET /api/tours/<occurrenceId>` — `seatsReserved` should be decremented

### Postman: Payment Before Expiry (Happy Path)

1. Create booking → `PendingPayment`
2. `POST /api/payments/create-session` → get `sessionId`
3. `POST /api/payments/mock/confirm/<sessionId>` → booking → `Confirmed`
4. Wait for scheduler to run (up to 60s)
5. `GET /api/traveler/bookings/<bookingId>` → still `Confirmed` (not Expired)

### Edge Cases Verified

- ✅ Payment confirmed during scheduler run → optimistic lock prevents double-write
- ✅ Multiple expired bookings processed in one job run
- ✅ Booking without any payment session still expires correctly
- ✅ Frontend timer stops ticking when expired, re-fetches booking, shows expired UI

---

## Configuration

To shorten the timeout for demo purposes, edit the service constant in `BookingService.createBooking`:

```java
booking.setCartExpiresAtUtc(Instant.now().plus(15, ChronoUnit.MINUTES));
// Change 15 to e.g. 2 for a 2-minute demo window
```

To speed up the scheduler for demos, change `PaymentTimeoutJob`:

```java
@Scheduled(fixedRate = 60_000) // Change to 10_000 for 10-second checks
```
