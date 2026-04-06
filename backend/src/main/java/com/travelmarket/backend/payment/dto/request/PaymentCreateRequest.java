package com.travelmarket.backend.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /api/payments/create-session.
 *
 * The traveler calls this after their booking is created (status = PendingPayment).
 * The backend validates the booking belongs to them, creates a Stripe Checkout
 * Session, saves the Payment row, and returns the checkoutUrl.
 *
 * Flow:
 *   1. Traveler creates booking → status = PendingPayment
 *   2. Frontend calls POST /api/payments/create-session with { bookingId }
 *   3. Backend returns PaymentResponse with checkoutUrl
 *   4. Frontend redirects traveler to checkoutUrl (Stripe-hosted page)
 */
@Data
public class PaymentCreateRequest {

    /**
     * ID of the booking to pay for.
     * Must belong to the authenticated traveler.
     * Must be in PendingPayment status.
     */
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
}
