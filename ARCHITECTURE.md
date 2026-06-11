# Tourongo — Architecture

Derived from the actual source code. Every service, job, and pattern documented here exists in the codebase.

---

## 1. Layered Backend Architecture

```
HTTP Request
     ↓
Controller (@RestController)
  — Parses request, returns response
  — No business logic, no DB access
  — Passes authenticated user's email to service (never trusts path IDs alone)
     ↓
Service (@Service + @Transactional)
  — All business logic
  — Calls repositories
  — Calls NotificationService, EmailService, StripePaymentService
  — Uses TimeService.getCurrentUtc() for all timestamps
     ↓
Repository (JpaRepository + @Query JPQL)
  — Data access only
  — All queries on soft-deletable entities include AND entity.deletedAtUtc IS NULL
     ↓
PostgreSQL (via Hibernate)
```

**Ownership enforcement**: Every service method that mutates data re-validates the authenticated user's ownership via their email. The path `{id}` alone is never trusted.

---

## 2. Security Layer

### JWT Token Architecture

| Token | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| Access token | `localStorage` (client) | 15 minutes | Authenticate API requests |
| Refresh token | HttpOnly cookie (`/api/auth` path) | 7 days (30 with "remember me") | Silently re-issue access tokens |

The refresh cookie is scoped to `/api/auth`, so it's only sent to the refresh endpoint — not to every API call.

### Auto-Refresh (Frontend)

`src/lib/api/client.ts` has a response interceptor:
1. Any 401 → call `POST /api/auth/refresh` (cookie sent automatically)
2. Concurrent 401s are queued — only one refresh call fires
3. On success: new token saved, all queued requests retried with new token
4. On failure: `clearAccessToken()` → user effectively logged out

### Rate Limiting

`RateLimiterService.java` provides in-memory fixed-window rate limiting. Applied to sensitive auth endpoints (password reset, email verification) to prevent abuse. Per-server-instance — upgrade to Redis for multi-node deployment.

### OAuth2 Flow

1. Frontend → `GET /oauth2/authorize/google` (Spring OAuth2 redirect)
2. Google → `GET /login/oauth2/code/google?code=...`
3. `OAuth2LoginSuccessHandler` → exchanges code → fetches user info → upserts user → issues JWT → redirects to `/auth/oauth-callback?token=...`
4. `OAuth2LoginFailureHandler` → redirects to `/auth/login?error=...`
5. OAuth users without passwords can set one via `POST /api/auth/password/setup/request` (sends 6-digit code) + `POST /api/auth/password/setup/confirm`

---

## 3. Tour Domain Model

```
TourTemplate (the reusable blueprint)
├── Guide creates once
├── Status: DRAFT → PENDING_REVIEW → PUBLISHED / REJECTED / PAUSED / ARCHIVED
├── Pricing config: basePrice, currency, dynamicPricing (JSON), groupDiscount fields
├── Halal flags: halalFriendly, hasPrayerSpace, halalFoodOptions, genderSensitiveGuides
├── Media: List<TourMedia> (ordered, first = cover, soft-deletable)
├── Route: List<TourMapPoint> (ordered waypoints for Leaflet trail)
├── Languages, inclusions, exclusions, requirements, whatToBring, tags
└── instantBook: true → Instant Book, false → Request to Book

TourOccurrence (the scheduled event)
├── startTimeUtc, endTimeUtc (TIMESTAMPTZ)
├── maxCapacity, seatsReserved (LOCKED for writes via SELECT ... FOR UPDATE)
├── price (can differ per occurrence for one-off pricing)
├── status: SCHEDULED / IN_PROGRESS / COMPLETED / CANCELLED / FULL
├── recurrencePattern (ONCE / WEEKLY / CUSTOM)
└── @Version for optimistic locking (secondary safety net)
```

### Tour Template Status Transitions

```
DRAFT → [guide submits] → PENDING_REVIEW
PENDING_REVIEW → [admin approves] → PUBLISHED
PENDING_REVIEW → [admin rejects] → DRAFT (with rejection reason)
PENDING_REVIEW → [guide withdraws] → DRAFT
PUBLISHED → [guide pauses] → PAUSED
PAUSED → [guide resumes] → PUBLISHED
PUBLISHED → [guide archives] → ARCHIVED
```

---

## 4. Booking Domain

### Status Machine

```
Instant Book:
  PendingPayment ──[payment success]──→ Confirmed ──[QR scan]──→ InProgress ──[guide completes]──→ Completed
       │                                     │
       │[PaymentTimeoutJob after 15min]       │[traveler/guide cancels]
       ↓                                     ↓
     Expired                             Cancelled

Request to Book:
  PendingGuide ──[guide accepts]──→ PendingPayment → (same as Instant Book above)
      │
      │[guide rejects / 24h timeout / BookingStatusCleanupJob]
      ↓
   Cancelled
```

### Seat Reservation Timing

- **Instant Book**: seats reserved immediately on `createBooking()` → locked during payment window → released if `Expired`
- **Request to Book**: seats also reserved immediately on `createBooking()` to prevent overbooking during guide review window → guide accept/reject → if rejected, seats released

### QR Code Flow

1. `createBooking()` generates `UUID.randomUUID()` stored as `booking.qrCode`
2. Traveler's booking detail page renders `qrCode` via `qrcode.react`
3. QR is only accessible via the traveler's own booking detail — guide can't see it
4. QR activates 1 hour before tour start time (frontend logic)
5. Guide's on-tour page uses `html5-qrcode` scanner
6. Scanner sends token to `POST /api/guide/bookings/checkin-by-qr/{qrToken}`
7. Server validates token belongs to one of the guide's own occurrences (cross-guide check-in impossible)
8. Transitions booking: `Confirmed` → `InProgress`

### Booking Reference Format

Displayed as `SH-XXXX` (e.g. `SH-0117`) where XXXX is the booking database ID, zero-padded to 4 digits.

---

## 5. Pricing Engine — PricingService

Single source of truth for all pricing. Pure logic — saves nothing.

**Pipeline for a booking:**
```
basePrice × peopleCount
         = subtotal

- group discount (if hasGroupDiscount AND peopleCount >= threshold)
         = after-group subtotal

- loyalty tier discount (BRONZE=0%, SILVER=5%, GOLD=10%)
         = after-tier subtotal

× dynamic multiplier (weekend OR Lebanese holiday — holiday takes priority)
         = working price

× platform fee rate (base 10% × guide.currentFeeMultiplier)
         = platform fee amount (stays in platform Stripe account)

working price (capped at ≥0) = finalPrice
```

All thresholds and percentages from `LoyaltyProperties` (bound from `application.properties`) — zero hardcoding.

**Dynamic pricing detection** (`parseDynamicPricing`):
- JSON shape: `{ "weekendMultiplier": 1.2, "holidayMultiplier": 1.5 }`
- Legacy compat: values > 5 are treated as percent (e.g. 120 → 1.20)
- Lebanese public holidays: Jan 1, Jan 6, Feb 9, Mar 25, May 1, May 25, Aug 15, Nov 1, Nov 22, Dec 25
- Holiday takes priority over weekend when both apply on the same date
- Multipliers capped at 5.0

**Guide fee multiplier:**
- Default `1.0` (neutral)
- Range: `[0.5, 1.5]` (clamped)
- Admin can adjust per guide to reward top performers or penalize underperformers
- Effective rate = `platformFeeRate × guide.currentFeeMultiplier`

**Loyalty tier upgrades:**
- Auto-triggered in `BookingService.completeBooking()` via `PricingService.recalculateLoyaltyTier()`
- BRONZE: default (0 trips) / SILVER: ≥5 trips / GOLD: ≥10 trips (configurable in properties)

---

## 6. Concurrency — Double-Booking Prevention

Two-layer strategy. See [`docs/CONCURRENCY.md`](docs/CONCURRENCY.md) for sequence diagrams.

**Layer 1 — Pessimistic Write Lock** (`SELECT … FOR UPDATE`):
```java
// In BookingService.createBooking():
TourOccurrence occurrence = resolveOccurrenceWithLock(request.getOccurrenceId());
// TourOccurrenceRepository.findByIdWithLock():
//   @Lock(LockModeType.PESSIMISTIC_WRITE)
//   @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "2000"))
```
- Blocks ALL concurrent threads for the same occurrence until the first commits
- 2000ms timeout → HTTP 409 if lock not acquired
- Prevents TOCTOU: no two threads ever simultaneously read stale `seatsReserved`

**Layer 2 — Optimistic Locking** (`@Version`):
- `Booking` entity has a `@Version` column
- Secondary safety net for `PaymentTimeoutJob` scheduler vs. Stripe webhook race
- If two writers collide: one gets `OptimisticLockException` → caught and logged → booking remains correct

**Deadlock Prevention** (reschedule / update booking):
- When locking two occurrences (old + new), always acquire in ascending ID order
- Two threads swapping the same pair never deadlock

**Partial index for lock query performance:**
```sql
-- V54 migration
CREATE INDEX IF NOT EXISTS idx_tour_occurrences_active_id
    ON tour_occurrences (id)
    WHERE deleted_at_utc IS NULL;
```

---

## 7. Payment Pipeline

### Stripe Checkout (Instant Book)

```
1. createBooking() → status=PendingPayment, seats reserved, cartExpiresAtUtc=now+15min

2. POST /api/payments/create-session
   → StripePaymentService creates Session
   → Returns { sessionId, checkoutUrl }

3. Frontend redirects to Stripe-hosted checkout

4. Stripe → POST /api/payments/webhook (checkout.session.completed)
   → Webhook signature verified via stripe.webhook-secret
   → Booking: PendingPayment → Confirmed
   → cartExpiresAtUtc set to NULL (prevents scheduler from expiring it)
   → StripePaymentService.scheduleGuidePayoutFor() sets payoutEligibleAtUtc = now + freeze-hours

5. If no payment within 15 minutes:
   → PaymentTimeoutJob finds booking via partial index
   → Status: Expired, seats released, waitlist promoted, notifications sent
```

### Escrow Model

```
Traveler pays → money in PLATFORM Stripe account → Payment.payoutStatus = Pending

Tour completed → payoutEligibleAtUtc = completedAtUtc + freeze-hours (default 48h)

PayoutReleaseJob (hourly):
  → Finds payments where status=Captured, payoutStatus=Pending, payoutEligibleAtUtc <= now
  → Calls Stripe Transfer API: platform → guide's Stripe Connect account
  → Amount = booking.finalPrice - booking.platformFeeSnapshot
  → Sets payoutStatus=Transferred, stripeTransferId, payoutReleasedAtUtc
  → If guide has no Stripe account: payoutStatus=Failed (admin resolves)
```

**Mock mode** (`stripe.mock-mode=true`): `POST /api/payments/mock/confirm/{sessionId}` simulates the Stripe webhook. `PayoutReleaseJob` generates a `mock_tr_...` transfer ID instead of calling Stripe.

### Traveler Payment Methods

Stored in `traveler_payment_methods` table (soft-deletable). When a traveler deletes their default card, the next active card is automatically promoted to default.

---

## 8. Real-Time System

Single WebSocket endpoint: `/ws-chat` (STOMP over SockJS). Authentication via `Authorization: Bearer <token>` in STOMP CONNECT frame.

**Topics:**
```
/topic/chat/{conversationId}     — bidirectional chat messages + READ_RECEIPT events
/topic/notifications/{userId}   — personal notification stream
```

**Chat flow:**
1. `POST /api/chat/initiate` → creates or finds conversation between traveler + guide
2. `POST /api/chat/conversations/{id}/messages` → persists message in DB + broadcasts to `/topic/chat/{conversationId}`
3. `PUT /api/chat/conversations/{id}/read` → marks messages read + broadcasts `READ_RECEIPT` type message
4. Frontend `useChatSocket` hook handles both regular messages and read receipts

**Notification flow:**
1. Any service calls `notificationService.createNotification(userId, type, title, message, refId, refType)`
2. `NotificationService` → persists to DB → `SimpMessagingTemplate.convertAndSend` to `/topic/notifications/{userId}`
3. Frontend `useNotificationSocket` hook receives message → prepends to notification list → increments badge
4. `usePushNotifications` checks if browser Notification permission is `granted` → shows native popup when tab is backgrounded

**In-app-only variant** (`createNotificationInAppOnly`): Used by `ReviewReminderService` since it already sends a richer custom HTML email — prevents duplicate plain-text email from the standard notification path.

---

## 9. Scheduled Jobs

5 background jobs run permanently:

| Job | Schedule | Responsibility |
|-----|----------|----------------|
| `PaymentTimeoutJob` | Every 60s (`fixedRate`) | Finds `PendingPayment` bookings past `cartExpiresAtUtc`, sets `Expired`, releases seats, promotes waitlist, sends notifications |
| `BookingStatusCleanupJob` | Every 1h (`fixedRate`) | Auto-completes stale `InProgress` bookings; auto-cancels (No-Show) overdue `Confirmed` bookings for users not currently active |
| `ReviewReminderJob` | Every 1h (`fixedRate`) | Finds `Completed` bookings in a [now-25h, now-24h] sliding window where `reviewReminderSentAt IS NULL` → sends branded HTML email + in-app notification |
| `SuspensionCleanupJob` | Every 60s (`fixedDelay`) | Lifts timed suspensions whose expiry date has passed |
| `PayoutReleaseJob` | Every hour at :00 (cron) | Releases escrowed funds to guide Stripe Connect accounts after freeze window |

All jobs have top-level try-catch to prevent a transient DB error from killing the scheduler thread.

---

## 10. Notification Types (Complete List)

`NotificationType` enum — 30 types:

```
Auth:         EMAIL_VERIFIED, PASSWORD_CHANGED, PROFILE_COMPLETED, SETUP_PASSWORD_REMINDER
Verification: VERIFICATION_SUBMITTED, VERIFICATION_APPROVED, VERIFICATION_REJECTED
Bookings:     BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_EXPIRED
Payments:     PAYMENT_SUCCESS, PAYMENT_FAILED, PAYOUT_PROCESSED
Reviews:      REVIEW_REMINDER
Disputes:     DISPUTE_OPENED, DISPUTE_STATUS_CHANGED, DISPUTE_RESOLVED, DISPUTE_REJECTED
Chat:         NEW_MESSAGE
Admin:        SYSTEM_ALERT, ACCOUNT_SUSPENDED, ACCOUNT_REACTIVATED
```

---

## 11. Frontend Architecture

### API Layer

17 typed Axios modules in `src/lib/api/`:
`admin, auth, blacklist, chat, client, discovery, disputes, guide-payouts, guides, notifications, payment, support, tours, traveler-payments, traveler, travelers, wishlist`

`client.ts` — single Axios instance with:
- Request interceptor: injects `Authorization: Bearer <token>`
- Response interceptor: 401 → silent refresh → retry (queue concurrent 401s)
- SSR: uses `http://localhost:8081` directly; browser: uses relative path (proxied by Next.js)

### State Management

| Context | What it manages |
|---------|----------------|
| `AuthContext` | Current user, auth methods, token management, profile completion state |
| `FilterContext` | Tour search filter state (persisted across navigation) |
| `SignupContext` | Multi-step signup form state (role → account → terms) |
| `WishlistContext` | Wishlist items, add/remove actions |

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useChatSocket` | STOMP subscription to `/topic/chat/{id}`, read receipts |
| `useNotificationSocket` | STOMP subscription to `/topic/notifications/{userId}` |
| `usePushNotifications` | Browser Notification API permission + push display |
| `usePaymentCountdown` | Ticks every second, returns `{ minutesLeft, secondsLeft, isExpired, urgency }` where urgency ∈ `normal/warning/critical` |
| `useBadgeReset` | Resets unread notification badge count |
| `useTourDetail` | Tour detail data fetching + occurrence selection |

### Design System

Defined in `tailwind.config.ts` — electric blue (#2563eb light / #3b82f6 dark) + orange (#f97316 light / #fb923c dark). Custom tokens for:
- Background elevations (base, section, card, paper, hover)
- Text hierarchy (primary, secondary, muted)
- Borders (default, strong)
- Semantic colors (danger red, warning yellow, success green)
- Grid background textures, hero gradients, elevation shadows
- Dark mode via `class` strategy (`next-themes`)

---

## 12. Admin Audit System

`AdminAuditService` logs every admin action to the `admin_audit_events` table. Each event records:
- Timestamp, admin user, action type string, target entity type, target entity ID
- Before/after JSON payload (uses Jackson `LinkedHashMap` for ordered keys)
- Free-text description

Tracked actions include: `GUIDE_VERIFY_APPROVE`, `GUIDE_VERIFY_REJECT`, `TOUR_APPROVED`, `TOUR_REJECTED`, `USER_DEACTIVATE`, `USER_REACTIVATE`, `USER_SUSPEND`, `USER_UNSUSPEND`, `USER_BAN`, `USER_ACTIVATE`, `ADMIN_BROADCAST_EMAIL`, `PAYOUT_*`, and more.

The audit trail is immutable — there is no delete endpoint for audit events. Displayed in reverse chronological order in the admin UI.
