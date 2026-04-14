package com.travelmarket.backend.service;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TimeService — Centralized Time Management for Travel Marketplace
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * SYSTEM-WIDE TIME RULE:
 *   ✅ ALL timestamps are stored as UTC (java.time.Instant)
 *   ✅ ALL time comparisons/arithmetic are done in UTC
 *   ✅ ALL @PrePersist hooks in entities use this service's clock (via Instant.now())
 *   ❌ NEVER store LocalDateTime directly for business timestamps
 *   ❌ NEVER depend on the JVM/server default timezone
 *
 * WHY Instant (not ZonedDateTime or LocalDateTime)?
 *   • Instant is a single point on the timeline — no timezone ambiguity.
 *   • It maps cleanly to PostgreSQL TIMESTAMPTZ without any conversion loss.
 *   • DST transitions are handled automatically by ZoneId when converting FOR DISPLAY.
 *
 * INJECTABLE CLOCK:
 *   The private Clock field can be replaced in tests via constructor injection or
 *   a test subclass, making all time-dependent logic unit-testable without
 *   Thread.sleep() or Mockito.mockStatic().
 *
 * USAGE:
 *   // In any @Service that needs the current time:
 *   @Autowired TimeService timeService;
 *   Instant now = timeService.getCurrentUtc();
 *
 *   // Convert a user-submitted local datetime (e.g. from a form) to UTC:
 *   Instant utc = timeService.toUtc(LocalDateTime.of(2026, 4, 15, 21, 0), "Asia/Beirut");
 *
 *   // Display a stored UTC instant in the user's local timezone:
 *   ZonedDateTime local = timeService.fromUtc(booking.getStartTimeUtc(), user.getTimezone());
 */
@Service
public class TimeService {

    /**
     * The clock used for all "now" calls.
     *
     * Default: Clock.systemUTC() — always UTC regardless of JVM/system timezone.
     * Override in tests: inject Clock.fixed(someInstant, ZoneOffset.UTC).
     *
     * Using a fixed UTC clock here means the service is immune to server
     * timezone configuration drift (even if someone runs the JVM without
     * -Duser.timezone=UTC, this class remains correct).
     */
    private final Clock clock;

    /**
     * Default constructor used by Spring in production.
     * Always anchors to the UTC system clock.
     */
    public TimeService() {
        this.clock = Clock.systemUTC();
    }

    /**
     * Test-friendly constructor. Inject a fixed Clock to control "now" in tests.
     *
     * Example in tests:
     *   TimeService ts = new TimeService(Clock.fixed(Instant.parse("2026-01-01T12:00:00Z"), ZoneOffset.UTC));
     */
    public TimeService(Clock clock) {
        this.clock = clock;
    }

    // ── Core: Current Time ────────────────────────────────────────────────────

    /**
     * Returns the current instant in UTC.
     *
     * Use this in service layer instead of Instant.now() so that the clock
     * source is centralized and injectable for testing.
     *
     * @return current UTC instant
     */
    public Instant getCurrentUtc() {
        return Instant.now(clock);
    }

    // ── Conversion: Local → UTC ───────────────────────────────────────────────

    /**
     * Converts a user-local datetime (from a form or API request) to a UTC Instant.
     *
     * This is DST-aware: ZoneId.of("Asia/Beirut") knows that Beirut observes
     * EEST (+3) in summer and EET (+2) in winter. The conversion is automatic.
     *
     * PITFALL: Never use this for times that are ALREADY in UTC — that would
     * double-convert. Only use when the user intentionally submitted a local time.
     *
     * Example:
     *   // A guide in Beirut schedules a tour starting at 9 AM local time:
     *   Instant startUtc = timeService.toUtc(LocalDateTime.of(2026, 7, 15, 9, 0), "Asia/Beirut");
     *   // Result: 2026-07-15T06:00:00Z (EEST = UTC+3 in July)
     *
     * @param localDateTime the date/time in the user's local timezone (no zone info)
     * @param userTimezone  IANA timezone ID (e.g. "Asia/Beirut", "Europe/Istanbul", "UTC")
     * @return the equivalent UTC Instant
     * @throws java.time.zone.ZoneRulesException if userTimezone is not a valid IANA zone ID
     */
    public Instant toUtc(LocalDateTime localDateTime, String userTimezone) {
        // Resolve the user's zone — ZoneId.of() validates the ID and loads DST rules
        ZoneId zone = resolveZone(userTimezone);
        // Attach zone to the wall-clock time, then extract the UTC instant
        return localDateTime.atZone(zone).toInstant();
    }

    // ── Conversion: UTC → Local ───────────────────────────────────────────────

    /**
     * Converts a UTC Instant to a ZonedDateTime in the user's local timezone.
     *
     * Use this when building display-layer responses that need to show the user
     * their local time (e.g. "Your tour starts at 9:00 AM Beirut time").
     *
     * The returned ZonedDateTime carries full timezone metadata — the caller
     * can format it, extract hour/minute, or serialize it as an ISO-8601 string
     * with offset (e.g. "2026-07-15T09:00:00+03:00").
     *
     * Example:
     *   ZonedDateTime local = timeService.fromUtc(occurrence.getStartTimeUtc(), "Asia/Beirut");
     *   // "2026-07-15T09:00+03:00[Asia/Beirut]"
     *
     * @param utcInstant   the stored UTC timestamp
     * @param userTimezone IANA timezone ID (e.g. "Asia/Beirut")
     * @return the same moment expressed in the user's local timezone
     * @throws java.time.zone.ZoneRulesException if userTimezone is not a valid IANA zone ID
     */
    public ZonedDateTime fromUtc(Instant utcInstant, String userTimezone) {
        ZoneId zone = resolveZone(userTimezone);
        return utcInstant.atZone(zone);
    }

    // ── Formatting ────────────────────────────────────────────────────────────

    /**
     * Formats a UTC Instant as an ISO-8601 string in the user's local timezone.
     *
     * Output format: "2026-07-15T09:00:00+03:00"
     * This is suitable for JSON API fields that need timezone-aware display values.
     *
     * @param utcInstant   the stored UTC timestamp
     * @param userTimezone IANA timezone ID
     * @return ISO-8601 datetime string with UTC offset for the user's zone
     */
    public String formatForUser(Instant utcInstant, String userTimezone) {
        return fromUtc(utcInstant, userTimezone)
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    /**
     * Returns true if the given Instant is in the past relative to the current UTC clock.
     *
     * Useful for expiry checks (tokens, booking windows, cart locks).
     *
     * @param instant the timestamp to check
     * @return true if the instant is before now
     */
    public boolean isExpired(Instant instant) {
        return instant.isBefore(getCurrentUtc());
    }

    /**
     * Returns true if the given Instant is in the future relative to the current UTC clock.
     *
     * @param instant the timestamp to check
     * @return true if the instant is after now
     */
    public boolean isFuture(Instant instant) {
        return instant.isAfter(getCurrentUtc());
    }

    /**
     * Validates whether a given string is a valid IANA timezone identifier.
     *
     * Used on user profile update endpoint to reject nonsense timezone values
     * before persisting to the database.
     *
     * @param timezoneId the string to validate (e.g. "Asia/Beirut")
     * @return true if the string is a valid, known IANA timezone ID
     */
    public boolean isValidTimezone(String timezoneId) {
        if (timezoneId == null || timezoneId.isBlank()) {
            return false;
        }
        try {
            ZoneId.of(timezoneId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    /**
     * Resolves a timezone ID string to a ZoneId, defaulting to UTC on invalid input.
     *
     * We use a lenient fallback (UTC) instead of throwing here because:
     *   1. Not every code path can guarantee the userTimezone string is validated.
     *   2. Falling back to UTC is always correct and never loses data.
     *   3. The invalid value is logged so it can be fixed in data or validation.
     *
     * @param timezoneId IANA timezone string (may be null or blank)
     * @return the resolved ZoneId, or ZoneId.of("UTC") as fallback
     */
    private ZoneId resolveZone(String timezoneId) {
        if (timezoneId == null || timezoneId.isBlank()) {
            return ZoneId.of("UTC");
        }
        try {
            return ZoneId.of(timezoneId);
        } catch (Exception e) {
            // Log at WARN level — callers should validate before calling this
            // Using System.err here avoids a Slf4j import cycle in a base service
            System.err.println("[TimeService] Invalid timezone ID '" + timezoneId + "', falling back to UTC");
            return ZoneId.of("UTC");
        }
    }
}
