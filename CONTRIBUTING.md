# Contributing to Tourongo

---

## Table of Contents
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Backend Guidelines](#backend-guidelines)
- [Frontend Guidelines](#frontend-guidelines)
- [Database Migrations](#database-migrations)
- [Scheduled Jobs](#scheduled-jobs)
- [Testing](#testing)

---

## Getting Started

1. Fork the repository and clone your fork
2. Set upstream: `git remote add upstream https://github.com/mo-maarouf/Graduation-Project.git`
3. Follow [`ENV_REFERENCE.md`](ENV_REFERENCE.md) to set up your local environment
4. Note: backend runs on **port 8081**, not 8080

---

## Branch Strategy

| Prefix | Use for | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/guide-bulk-schedule-improvements` |
| `fix/` | Bug fix | `fix/waitlist-promotion-race-condition` |
| `docs/` | Documentation only | `docs/add-api-reference` |
| `refactor/` | No behavior change | `refactor/extract-pricing-helpers` |
| `chore/` | Build/deps/CI | `chore/bump-spring-boot` |
| `test/` | Adding tests | `test/booking-service-timeout` |

Always branch from `main`:
```bash
git checkout main && git pull upstream main
git checkout -b feat/your-feature
```

---

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <short description>
```
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
```
feat(booking): add bulk schedule validation for recurring occurrences
fix(pricing): cap dynamic pricing multiplier at 5x before BigDecimal multiply
refactor(notification): split in-app-only variant to avoid duplicate emails
docs(env): add payout freeze-hours to ENV_REFERENCE
```

---

## Pull Request Process

1. One logical change per PR
2. Fill in the PR template checklist
3. Link issues with `Closes #N`
4. At least one review approval required
5. Squash on merge

---

## Backend Guidelines

### Layer Rules

```
HTTP Request → Controller → Service → Repository → Database
```
- Controllers: HTTP concerns only. No business logic. No DB calls.
- Services: all business logic, marked `@Transactional` when writing
- Repositories: data access only. Always include `AND entity.deletedAtUtc IS NULL` for soft-deletable entities

### Time — ALWAYS use TimeService in Services

```java
// ✅ Correct — injectable, testable, centralized
Instant now = timeService.getCurrentUtc();
booking.setCartExpiresAtUtc(timeService.getCurrentUtc().plus(15, ChronoUnit.MINUTES));

// ❌ Wrong — bypasses TestService, fails tests
Instant now = Instant.now();
LocalDateTime now = LocalDateTime.now();
```

`@PrePersist` / `@PreUpdate` hooks in entities may use `Instant.now()` directly (Spring beans not injectable there).

All DB columns must use `TIMESTAMPTZ`, never `TIMESTAMP`. Java fields must use `Instant`, never `LocalDateTime`.

### Soft Deletes — Never Hard Delete Business Entities

```java
// ✅ Correct
entity.setDeletedAtUtc(timeService.getCurrentUtc());
repository.save(entity);

// ❌ Wrong
repository.delete(entity);
```

All queries on soft-deletable entities must explicitly filter:
```java
// ✅ Always include this
@Query("SELECT e FROM Entity e WHERE e.id = :id AND e.deletedAtUtc IS NULL")

// ❌ Never use derived query names on soft-deletable entities
repository.findById(id)  // Does NOT filter deleted rows
```

Soft-deletable entities in the codebase: `TourTemplate`, `TourOccurrence`, `Booking`, `WaitlistEntry`, `TourMedia`, `TravelerPaymentMethod`, `Review`

### Concurrency — Booking Service Critical Section

When reading and writing `seatsReserved` on a `TourOccurrence`, you **must** acquire the pessimistic lock first:
```java
// ✅ Always use the lock variant
TourOccurrence occurrence = resolveOccurrenceWithLock(occurrenceId);
// Now safe to: check capacity, increment seatsReserved, save booking

// ❌ Never read seatsReserved without the lock
TourOccurrence occurrence = occurrenceRepository.findById(id);
// Race condition: two threads can both see seatsReserved=9 → both overbooking
```

Lock timeout is 2000ms (HTTP 409 on timeout). When locking two occurrences simultaneously (reschedule), always lock by ascending ID order to prevent deadlocks.

### Pricing — Always Use PricingService

Never compute prices manually. `PricingService.calculatePrice()` handles the full pipeline:
- Subtotal → group discount → loyalty tier discount → dynamic pricing (weekend/holiday) → platform fee

All percentage values come from `LoyaltyProperties` — never hardcode numbers.

### Error Handling

For simple cases: `throw new ResponseStatusException(HttpStatus.XXX, "message")`
For complex domain cases: throw a custom exception and handle in `GlobalExceptionHandler`.

---

## Frontend Guidelines

### Axios API Calls

All API calls go through `src/lib/api/client.ts`. The client:
- Attaches JWT automatically to every request
- On 401: silently refreshes token and retries (queues concurrent 401s)
- Proxies `/api/*` → `:8081` via Next.js rewrites

Use the typed module for your domain (e.g. `src/lib/api/tours.ts`, `src/lib/api/traveler.ts`). Never create a new Axios instance.

### WebSocket Hooks

- Chat: `useChatSocket(conversationId, onMessage, onReadReceipt)` in `src/lib/hooks/useChatSocket.ts`
- Notifications: `useNotificationSocket(onNotification)` in `src/lib/hooks/useNotificationSocket.ts`
- Both connect to `/ws-chat` (the single STOMP endpoint) with `Authorization: Bearer <token>` in connect headers

### Component Rules

- Functional components with TypeScript props
- Named exports for components
- Keep components focused — extract hooks for data-fetching logic
- Tailwind v4 utilities only (no inline styles, no new arbitrary colors)
- Use Framer Motion for animations (not CSS keyframes inside components)
- The design system is electric blue + orange — see `tailwind.config.ts`

### Map Components

Two reusable Leaflet components exist:
- `MapPicker.tsx` — click to pick a single location (fills lat/lng + address via reverse geocoding)
- `RouteBuilderMap.tsx` — click to add stops sequentially; builds an A→B→C trail

Both are in `src/components/ui/`.

---

## Database Migrations

### Naming

```
V{number}__{snake_case_description}.sql
```
Example: `V67__add_guide_impact_score_history.sql`

Current highest: **V66**. Your new migration must be **V67** or higher.

### Rules

- **Never modify** a migration that has already been committed to `main`
- Use `TIMESTAMPTZ`, never `TIMESTAMP`
- Use `IF NOT EXISTS` on `CREATE TABLE` and `CREATE INDEX`
- Add a partial index whenever adding `deleted_at_utc`
- Add a partial index whenever adding a column used by a scheduler query

### Partial Index Pattern

```sql
-- Add soft-delete column
ALTER TABLE your_table ADD COLUMN IF NOT EXISTS deleted_at_utc TIMESTAMPTZ;

-- Add matching partial index (only indexes active rows)
CREATE INDEX IF NOT EXISTS idx_your_table_not_deleted
    ON your_table (relevant_column)
    WHERE deleted_at_utc IS NULL;
```

### Scheduler Query Pattern

```sql
-- Example: index for a job that runs every hour and queries by status
CREATE INDEX IF NOT EXISTS idx_bookings_pending_payment_deadline
    ON bookings (cart_expires_at_utc)
    WHERE status = 'PendingPayment' AND deleted_at_utc IS NULL;
```

---

## Scheduled Jobs

All 5 jobs are in:
- `backend/.../jobs/PaymentTimeoutJob.java` — every 60s
- `backend/.../jobs/ReviewReminderJob.java` — every 1h
- `backend/.../jobs/BookingStatusCleanupJob.java` — every 1h
- `backend/.../jobs/SuspensionCleanupJob.java` — every 60s
- `backend/.../payment/jobs/PayoutReleaseJob.java` — hourly (cron)

**For demo/testing**, temporarily lower `fixedRate` to `10_000` (10 seconds). **Always revert before committing.**

---

## Testing

### Backend Unit Tests

- Use JUnit 5 + Mockito
- For time-dependent tests, inject a fixed `Clock` into `TimeService` — no `Thread.sleep()` or `Mockito.mockStatic()`

```java
Clock fixedClock = Clock.fixed(Instant.parse("2026-07-01T10:00:00Z"), ZoneOffset.UTC);
TimeService ts = new TimeService(fixedClock);
// Now ts.getCurrentUtc() is deterministic
```

### Manual Testing — Payment Timeout

```sql
-- Force expiry immediately (without waiting 15 minutes)
UPDATE bookings
SET cart_expires_at_utc = NOW() - INTERVAL '1 minute'
WHERE id = <booking_id> AND status = 'PendingPayment';
-- Wait up to 60 seconds for PaymentTimeoutJob to run
```

### Manual Testing — Review Reminder

```sql
-- Simulate 24+ hours passing after tour completion
UPDATE bookings
SET completed_at_utc = NOW() - INTERVAL '24 hours 30 minutes'
WHERE id = <booking_id>;
-- Lower ReviewReminderJob.fixedRate to 10_000 temporarily
```

### Manual Testing — Payout

Set `app.payout.freeze-hours=0` in `application.properties` and `stripe.mock-mode=true`. Complete a tour → payout becomes eligible immediately on next `PayoutReleaseJob` run.

### Postman

Import `TravelMarket_Chat_Tests.postman_collection.json` from the repo root. Contains collections for auth flows, booking lifecycle, payment flows, notifications, and chat endpoints.
