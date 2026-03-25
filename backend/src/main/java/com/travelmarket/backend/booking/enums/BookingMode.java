package com.travelmarket.backend.booking.enums;

/**
 * Determines how a booking progresses after creation.
 *
 * Resolved from TourTemplate.instantBook at booking creation time
 * and snapshotted onto the Booking row — the template setting can
 * change later without affecting existing bookings.
 *
 * DB CHECK constraint (V1):
 *   booking_mode IN ('Instant', 'Request')
 *
 * Instant → Booking goes directly to CONFIRMED (or PENDING_PAYMENT once
 *            the payment card is integrated).
 *
 * Request → Booking lands in PENDING_GUIDE awaiting guide acceptance.
 *            Auto-expires after 24 h (future automation card).
 */
public enum BookingMode {

    /** Guide has pre-approved all bookings; no manual confirmation required. */
    Instant,

    /** Guide reviews each booking request individually before confirming. */
    Request
}