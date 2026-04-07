package com.travelmarket.backend.payment.repository;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.payment.entity.Payment;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Payment entities.
 *
 * Key queries:
 *   findByStripeSessionId → webhook lookup (most critical path)
 *   findByBooking          → duplicate session guard in create-session flow
 *   findEligiblePayouts    → PayoutReleaseJob: transfer funds to guide after 48h
 *   findByBookingId        → traveler checks their payment status
 */
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Webhook lookup — the most critical query in the entire payment system.
     * When Stripe fires checkout.session.completed, the payload contains the
     * session ID. We look up the Payment row by this value to know which
     * booking to confirm.
     *
     * Uses the idx_payments_stripe_session index created in V45.
     */
    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    /**
     * Find any existing payment for a booking.
     * Used in create-session to prevent duplicate sessions:
     *   - If an Authorized payment already exists → return its existing checkoutUrl
     *   - If a Captured payment exists → reject (already paid)
     */
    Optional<Payment> findByBooking(Booking booking);

    /**
     * Convenience variant using booking ID (avoids loading the full Booking entity).
     * Used by GET /api/traveler/payments/{bookingId}.
     */
    Optional<Payment> findByBookingId(Long bookingId);

    /**
     * PayoutReleaseJob query — runs every hour.
     * Finds all payments where:
     *   1. Payment was successfully captured (real money is in platform account)
     *   2. Payout is still pending (not yet transferred to guide)
     *   3. The 48-hour freeze window has expired (payoutEligibleAtUtc has passed)
     *
     * Uses the idx_payments_payout_pending partial index created in V45.
     *
     * @param payoutStatus  PayoutStatus.Pending
     * @param paymentStatus PaymentStatus.Captured
     * @param now           Current timestamp; eligibleAtUtc must be <= this
     */
    @Query("""
            SELECT p FROM Payment p
            WHERE p.payoutStatus = :payoutStatus
              AND p.status       = :paymentStatus
              AND p.payoutEligibleAtUtc IS NOT NULL
              AND p.payoutEligibleAtUtc <= :now
            """)
    List<Payment> findEligiblePayouts(
            @Param("payoutStatus")  PayoutStatus  payoutStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("now")           Instant       now
    );

    /**
     * Fetch all payments related to a specific guide's tours.
     * Used for the Wallet/Earnings dashboard.
     */
    @Query("SELECT p FROM Payment p WHERE p.booking.occurrence.template.guide.id = :guideId")
    List<Payment> findAllByGuideId(@Param("guideId") Long guideId);
}
