package com.travelmarket.backend.security;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter.
 *
 * Notes:
 * - This is per-server-instance. If you deploy multiple instances, switch to Redis later.
 * - Uses fixed-window counters with automatic reset when window expires.
 */
@Service
public class RateLimiterService {

    private static class Counter {
        int count;
        Instant windowStart;

        Counter(int count, Instant windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }

    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    public void check(String key, int limit, Duration window, String message) {
        Instant now = Instant.now();

        counters.compute(key, (k, existing) -> {
            if (existing == null) {
                return new Counter(1, now);
            }

            // Reset window if expired
            if (existing.windowStart.plus(window).isBefore(now)) {
                existing.count = 1;
                existing.windowStart = now;
                return existing;
            }

            existing.count++;
            return existing;
        });

        Counter c = counters.get(key);
        if (c != null && c.count > limit) {
            // We throw after increment to keep logic consistent.
            // If you want "exactly limit", keep > limit.
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, message);
        }
    }

    /**
     * Optional: call this occasionally (e.g., scheduled) to keep memory small.
     * Not required for V1.
     */
    public void cleanup(Duration olderThan) {
        Instant now = Instant.now();
        counters.entrySet().removeIf(e -> e.getValue().windowStart.plus(olderThan).isBefore(now));
    }
}