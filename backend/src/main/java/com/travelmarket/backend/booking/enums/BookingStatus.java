package com.travelmarket.backend.booking.enums;

/**
 * Lifecycle states for a Booking.
 *
 * Transition rules (enforced in BookingService):
 *
 *   PENDING_PAYMENT  → CONFIRMED (after payment captured — future payment card)
 *                    → CANCELLED (payment failed / timed out)
 *
 *   PENDING_GUIDE    → CONFIRMED (guide accepts)
 *                    → CANCELLED (guide rejects, or 24 h timeout — future automation card)
 *
 *   CONFIRMED        → IN_PROGRESS (guide scans QR / marks check-in)
 *                    → CANCELLED   (traveler or admin cancels within policy)
 *
 *   IN_PROGRESS      → COMPLETED (guide marks completion after tour ends)
 *
 *   WAITLISTED       ← Booking row is created for a promoted waitlist traveler;
 *                       transitions immediately to PENDING_PAYMENT or CONFIRMED.
 *                       Keep the value so existing DB CHECK constraint is satisfied.
 *
 *   EXPIRED          ← Set by future automation when PENDING_GUIDE exceeds 24 h
 *                       or cart/payment window lapses.
 *
 * DB CHECK constraint (V1):
 *   status IN ('PendingPayment','PendingGuide','Confirmed',
 *              'InProgress','Completed','Cancelled','Waitlisted','Expired')
 *
 * Future cards that plug in here:
 *   - Payment card: PENDING_PAYMENT → CONFIRMED after Whish capture
 *   - No-show / dispute card: COMPLETED → admin investigation
 *   - Payout card: COMPLETED starts 48 h payout freeze
 *   - Review card: COMPLETED unlocks review eligibility
 */
public enum BookingStatus {

    /** Booking created; awaiting payment capture (Whish integration — future card). */
    PendingPayment,

    /**
     * Request-to-Book mode: guide must explicitly accept.
     * Auto-expires after 24 h (enforcement lives in future automation card).
     */
    PendingGuide,

    /** Fully confirmed; traveler has a valid seat. */
    Confirmed,

    /** Guide has scanned traveler QR / marked check-in; tour is underway. */
    InProgress,

    /** Tour finished; starts the 48 h payout freeze window (future payout card). */
    Completed,

    /**
     * Booking cancelled by traveler, guide, or admin.
     * refund_percent snapshot captures the applicable refund tier.
     */
    Cancelled,

    /**
     * Transitional status for waitlist-promoted bookings.
     * Kept for DB constraint compatibility; not used as a resting state.
     */
    Waitlisted,

    /** Booking window lapsed (cart timeout or guide acceptance window). */
    Expired
}