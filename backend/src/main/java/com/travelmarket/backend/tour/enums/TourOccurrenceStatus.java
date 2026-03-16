package com.travelmarket.backend.tour.enums;

/**
 * Tracks the state of a single scheduled occurrence of a tour.
 *
 * SCHEDULED → active, accepting bookings (seats still available)
 * FULL      → max capacity reached; no more bookings unless a seat opens
 * COMPLETED → the tour has taken place
 * CANCELLED → occurrence was cancelled by guide or admin
 *
 * Stored as a VARCHAR string in the DB (never as ordinal).
 */
public enum TourOccurrenceStatus {
    SCHEDULED,
    FULL,
    COMPLETED,
    CANCELLED
}