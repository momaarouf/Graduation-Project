package com.travelmarket.backend.payment.controller;

import com.travelmarket.backend.payment.dto.response.PaymentResponse;
import com.travelmarket.backend.payment.service.StripePaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Mock payment endpoints — ONLY active when stripe.mock-mode=true.
 *
 * These endpoints simulate the Stripe webhook events that would normally be fired
 * after a traveler pays on Stripe's hosted checkout page. Use them in Postman
 * or the frontend to demonstrate the full payment lifecycle without a real
 * Stripe account.
 *
 * ── Demo Flow ─────────────────────────────────────────────────────────────────
 *   1. POST /api/payments/create-session
 *      → response includes: { "sessionId": "mock_sess_abc123", "checkoutUrl": "MOCK — call..." }
 *
 *   2a. POST /api/payments/mock/confirm/mock_sess_abc123    ← happy path
 *       → booking status: PendingPayment → CONFIRMED ✅
 *       → payment status: Authorized    → Captured  ✅
 *
 *   2b. POST /api/payments/mock/fail/mock_sess_abc123       ← negative path
 *       → booking status: PendingPayment → EXPIRED ❌
 *       → payment status: Authorized    → Failed   ❌
 *
 *   3. Mark tour COMPLETED → PayoutReleaseJob runs
 *      → payoutStatus: Pending → Transferred ✅ (fake transfer ID generated)
 *
 * ── Security ──────────────────────────────────────────────────────────────────
 *   Requires authentication (JWT). Any authenticated user can call these
 *   in mock mode — appropriate for demo/test environments.
 *   These endpoints return 404 when stripe.mock-mode=false (production safety).
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class MockPaymentController {

    private final StripePaymentService stripePaymentService;

    /**
     * Simulates a successful Stripe payment.
     * Equivalent to: traveler paid → Stripe fired checkout.session.completed.
     *
     * POST /api/payments/mock/confirm/{sessionId}
     * Auth: any authenticated user (JWT required)
     *
     * @param sessionId the mock_sess_... ID returned by create-session
     */
    @PostMapping("/api/payments/mock/confirm/{sessionId}")
    public ResponseEntity<PaymentResponse> confirmPayment(@PathVariable String sessionId) {
        guardMockMode();

        log.info("[MockPayment] Simulating payment SUCCESS for session: {}", sessionId);
        PaymentResponse response = stripePaymentService.mockConfirmPayment(sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Simulates a declined / expired payment.
     * Equivalent to: traveler abandoned checkout → Stripe session expired.
     *
     * POST /api/payments/mock/fail/{sessionId}
     * Auth: any authenticated user (JWT required)
     *
     * @param sessionId the mock_sess_... ID returned by create-session
     */
    @PostMapping("/api/payments/mock/fail/{sessionId}")
    public ResponseEntity<PaymentResponse> failPayment(@PathVariable String sessionId) {
        guardMockMode();

        log.info("[MockPayment] Simulating payment FAILURE for session: {}", sessionId);
        PaymentResponse response = stripePaymentService.mockFailPayment(sessionId);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the current mock mode status.
     * Useful for the frontend to know whether to show real or simulated payment UI.
     *
     * GET /api/payments/mock/status
     * Auth: any authenticated user
     */
    @GetMapping("/api/payments/mock/status")
    public ResponseEntity<java.util.Map<String, Object>> mockStatus() {
        return ResponseEntity.ok(java.util.Map.of(
                "mockMode", stripePaymentService.isMockMode(),
                "message", stripePaymentService.isMockMode()
                        ? "Payment mock mode is ACTIVE — no real charges occur"
                        : "Payment mock mode is DISABLED — real Stripe is active"
        ));
    }

    // ── Guard ─────────────────────────────────────────────────────────────────

    /**
     * Safety guard: prevents mock endpoints from working in production.
     * Returns 404 (not 403) intentionally — mock endpoints should be invisible
     * when stripe.mock-mode=false, as if they don't exist.
     */
    private void guardMockMode() {
        if (!stripePaymentService.isMockMode()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Mock payment endpoints are disabled in production mode");
        }
    }
}
