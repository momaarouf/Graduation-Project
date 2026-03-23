package com.travelmarket.backend.tour.enums;

/**
 * Describes how often a recurring tour repeats.
 *
 * NONE    → one-off tour; no automatic repetition
 * DAILY   → repeats every day
 * WEEKLY  → repeats every week (same day of week)
 * MONTHLY → repeats every month (same day of month)
 *
 * Automatic scheduling logic using this field is out of scope for
 * the current card and will be implemented in a future automation job.
 *
 * Stored as a VARCHAR string in the DB (never as ordinal).
 */
public enum RecurrencePattern {
    NONE,
    DAILY,
    WEEKLY,
    MONTHLY,
    CUSTOM
}