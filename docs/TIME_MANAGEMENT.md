# TIME_MANAGEMENT.md — Tourongo Backend

> **Last Updated:** April 2026  
> **Scope:** All backend services, entities, and schedulers  
> **Author:** Time Management Service implementation

---

## 1. System-Wide Time Strategy

### The Rule: UTC Everywhere

| Do ✅ | Don't ❌ |
|---|---|
| Store all timestamps as `Instant` (UTC) | Use `LocalDateTime` for business timestamps |
| Use `TimeService.getCurrentUtc()` in service layer | Call `Instant.now()` or `LocalDateTime.now()` directly |
| Use `ZoneId.of("Asia/Beirut")` for DST-aware conversion | Hardcode a UTC offset like `+03:00` |
| Store user timezone as IANA ID (`"Asia/Beirut"`) | Store a raw offset like `"+03:00"` |
| Depend on `Clock.systemUTC()` explicitly | Rely on the JVM/server default timezone |
| Use `TIMESTAMPTZ` in PostgreSQL | Use `TIMESTAMP` (without timezone) for business fields |

### Why `Instant` and not `ZonedDateTime`?

`Instant` is a single point on the global timeline — it has no timezone ambiguity.  
`ZonedDateTime` carries timezone info, which is useful **only at the display layer**.  
`LocalDateTime` has no timezone at all — **must never be used for business timestamps**.

```
Timeline comparison:

Instant("2026-07-15T06:00:00Z")
  = ZonedDateTime("2026-07-15T09:00+03:00[Asia/Beirut]")   ← for display
  = ZonedDateTime("2026-07-15T06:00+00:00[UTC]")           ← storage
  ≠ LocalDateTime("2026-07-15T09:00")                      ← ambiguous!
```

---

## 2. The `TimeService`

**Package:** `com.travelmarket.backend.service.TimeService`

This is the **only** place where current UTC time is obtained in service layer code.

### Methods

| Method | Signature | Purpose |
|---|---|---|
| `getCurrentUtc()` | `→ Instant` | Current UTC time (injectable clock) |
| `toUtc()` | `(LocalDateTime, String zoneId) → Instant` | User local time → UTC |
| `fromUtc()` | `(Instant, String zoneId) → ZonedDateTime` | UTC → user local time |
| `formatForUser()` | `(Instant, String zoneId) → String` | ISO-8601 with offset for display |
| `isExpired()` | `(Instant) → boolean` | Is the instant in the past? |
| `isFuture()` | `(Instant) → boolean` | Is the instant in the future? |
| `isValidTimezone()` | `(String) → boolean` | Validates an IANA timezone ID |

### Usage Examples

```java
// ── In a @Service ─────────────────────────────────────────────────────────

@Autowired
private TimeService timeService;

// 1. Get current UTC time
Instant now = timeService.getCurrentUtc();

// 2. Set a cart expiry 15 minutes from now
booking.setCartExpiresAtUtc(timeService.getCurrentUtc().plus(15, ChronoUnit.MINUTES));

// 3. Convert a guide's submitted tour time (local Beirut) → UTC storage
//    Guide fills form: "Tour starts at 9:00 AM" in Beirut
LocalDateTime guideTourStart = LocalDateTime.of(2026, 7, 15, 9, 0);
Instant storedUtc = timeService.toUtc(guideTourStart, guide.getUser().getTimezone());
// Stored: 2026-07-15T06:00:00Z  (Beirut is UTC+3 in July / EEST)

// 4. Display a booking start time in the traveler's timezone
ZonedDateTime local = timeService.fromUtc(occurrence.getStartTimeUtc(), "Asia/Beirut");
// Produces: 2026-07-15T09:00+03:00[Asia/Beirut]

// 5. Format for JSON response
String display = timeService.formatForUser(occurrence.getStartTimeUtc(), "Asia/Beirut");
// Produces: "2026-07-15T09:00:00+03:00"

// 6. Expiry check
if (timeService.isExpired(booking.getCartExpiresAtUtc())) {
    // booking payment window has passed
}
```

### Injectable Clock (for unit testing)

```java
// In test, inject a fixed clock so time is deterministic
Clock fixedClock = Clock.fixed(
    Instant.parse("2026-07-15T06:00:00Z"),
    ZoneOffset.UTC
);
TimeService ts = new TimeService(fixedClock);

// Now ts.getCurrentUtc() always returns 2026-07-15T06:00:00Z
// No Thread.sleep(), no Mockito.mockStatic() needed!
```

---

## 3. Entity Audit Timestamps (`@PrePersist`)

Entity `@PrePersist` and `@PreUpdate` hooks use `Instant.now()` directly (not `TimeService`).  
This is **intentional and correct** — entities should not depend on Spring beans.

The only place `TimeService` is used is in **service layer methods** that need to:
- Set business-logic timestamps (cancellation, check-in, completion, payment capture)
- Compute future expiry times (cart lock, payout eligibility)
- Make time-based decisions (cancellation refund policy, occurrence bookability checks)

```java
// ✅ Entity @PrePersist — fine to use Instant.now() directly
@PrePersist
protected void onCreate() {
    createdAtUtc = Instant.now();   // Called by JPA, not Spring — no bean injection available
    updatedAtUtc = Instant.now();
}

// ✅ Service layer — use TimeService
booking.setCancelledAtUtc(timeService.getCurrentUtc());  // Testable, centralized
```

---

## 4. Conversion Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER SUBMITS: "9:00 AM" in their local timezone (e.g. Asia/Beirut)     │
│                              │                                          │
│         timeService.toUtc(LocalDateTime, "Asia/Beirut")                 │
│                              ▼                                          │
│  DATABASE STORES: 2026-07-15T06:00:00Z  (as TIMESTAMPTZ)               │
│                              │                                          │
│         timeService.fromUtc(Instant, userTimezone)                      │
│                              ▼                                          │
│  API RESPONSE: "2026-07-15T09:00:00+03:00"  (ISO-8601 with offset)     │
└─────────────────────────────────────────────────────────────────────────┘
```

### DST Handling

`ZoneId.of("Asia/Beirut")` is DST-aware via Java's built-in IANA timezone database:

| Date | Beirut offset | 9:00 AM Beirut = |
|---|---|---|
| January (EET) | UTC+2 | 07:00 UTC |
| July (EEST) | UTC+3 | 06:00 UTC |

`TimeService.toUtc()` handles this automatically. You never need to hardcode `+02:00` or `+03:00`.

---

## 5. User Timezone Field

The `User` entity (`users.timezone` column) stores the user's preferred IANA timezone ID.

**Default:** `"UTC"`  
**Examples:** `"Asia/Beirut"`, `"Europe/Istanbul"`, `"America/New_York"`, `"Asia/Riyadh"`

### Validating on Update

Use `TimeService.isValidTimezone()` before persisting to reject invalid values:

```java
if (!timeService.isValidTimezone(request.getTimezone())) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "Invalid timezone. Please use an IANA timezone ID (e.g. 'Asia/Beirut').");
}
user.setTimezone(request.getTimezone());
```

---

## 6. PostgreSQL Column Types

All timestamp columns **must** use `TIMESTAMPTZ` (timestamp with time zone):

```sql
-- ✅ Correct
created_at_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

-- ❌ Wrong — stores without timezone, vulnerable to server timezone changes
created_at_utc TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

In JPA, `Instant` maps cleanly to `TIMESTAMPTZ`. `LocalDateTime` maps to `TIMESTAMP` (without timezone) — **this is a bug** because the timezone context is silently lost.

---

## 7. Known Issue Fixed — `Notification` Entity

Prior to this implementation, the `Notification` entity used `LocalDateTime` for `createdAtUtc`:

```java
// ❌ Before (WRONG)
private LocalDateTime createdAtUtc;  // Timezone-ambiguous!
this.createdAtUtc = LocalDateTime.now(ZoneOffset.UTC);  // Fragile

// ✅ After (CORRECT)
private Instant createdAtUtc;  // Maps cleanly to TIMESTAMPTZ
// Set by @PrePersist: this.createdAtUtc = Instant.now();
```

The DB column (`created_at_utc TIMESTAMPTZ`) was already correct in the V51 migration.  
Only the JPA type mapping was wrong — **no migration needed**.

---

## 8. Common Pitfalls

### ❌ Pitfall 1: Mixing `LocalDateTime` and `Instant`

```java
// WRONG — don't compare these types directly
if (localDateTime.isBefore(Instant.now())) { ... }  // won't compile

// RIGHT — always convert to Instant first
Instant asUtc = timeService.toUtc(localDateTime, userTimezone);
if (asUtc.isBefore(timeService.getCurrentUtc())) { ... }
```

### ❌ Pitfall 2: Hardcoding UTC offset

```java
// WRONG — breaks during DST transitions
ZoneOffset beirut = ZoneOffset.ofHours(3);  // Not DST-aware!

// RIGHT — use IANA zone ID
ZoneId beirut = ZoneId.of("Asia/Beirut");   // DST-aware ✅
```

### ❌ Pitfall 3: Server timezone dependency

```java
// WRONG — depends on JVM default timezone (could be anything)
LocalDateTime.now()              // No timezone = ambiguous
Instant.now()                    // OK, but...

// RIGHT — explicitly UTC via TimeService
timeService.getCurrentUtc()      // Always UTC, injectable for tests
```

### ❌ Pitfall 4: Midnight boundary bugs

```java
// WRONG — can miss days when local midnight ≠ UTC midnight
LocalDate today = LocalDate.now();   // What timezone is "today" in?

// RIGHT — reason in Instant, convert only for display
Instant startOfDay = timeService.fromUtc(someInstant, userTimezone)
    .toLocalDate()
    .atStartOfDay(ZoneId.of(userTimezone))
    .toInstant();
```

---

## 9. Postman Test Snippets

### Test: Booking reflects UTC storage

```
POST /api/bookings
Authorization: Bearer <traveler-jwt>
Content-Type: application/json

{
  "occurrenceId": 1,
  "peopleCount": 2
}

→ Response:
{
  "createdAtUtc": "2026-04-15T18:00:00Z",   ← Z suffix = UTC ✅
  "cartExpiresAtUtc": "2026-04-15T18:15:00Z"
}
```

Verify `createdAtUtc` ends in `Z` (not an array `[2026,4,15,18,0,0]`).

### Test: Notification timestamp is UTC Instant

```
GET /api/notifications
Authorization: Bearer <user-jwt>

→ Response:
{
  "id": 1,
  "createdAtUtc": "2026-04-15T18:00:00Z"   ← Z suffix = UTC ✅
}
```

### Test: TimeService timezone conversion

```
// Guide in Beirut submits a tour starting 9 AM local time

POST /api/guide/occurrences
{
  "startTimeUtc": "2026-07-15T06:00:00Z"   ← TimeService.toUtc(9:00 AM, "Asia/Beirut")
}

// GET response to traveler with Asia/Beirut preference:
{
  "startTimeLocal": "2026-07-15T09:00:00+03:00"
}
```

---

## 10. Quick Reference

```
Instant.now()                → ❌ Use timeService.getCurrentUtc() in services
LocalDateTime                → ❌ Never for business timestamps
ZoneOffset.ofHours(3)        → ❌ Not DST-aware
ZoneId.of("Asia/Beirut")     → ✅ DST-aware
TimeService.getCurrentUtc()  → ✅ Centralized, testable UTC clock
TimeService.toUtc()          → ✅ Local → UTC (DST-safe)
TimeService.fromUtc()        → ✅ UTC → Local for display
TimeService.isExpired()      → ✅ Expiry check (cart lock, tokens)
```
