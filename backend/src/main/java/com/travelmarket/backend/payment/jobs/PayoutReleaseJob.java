package com.travelmarket.backend.payment.jobs;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Transfer;
import com.stripe.param.TransferCreateParams;
import com.travelmarket.backend.payment.entity.Payment;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import com.travelmarket.backend.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled job that releases held (escrowed) funds to guides after the
 * 48-hour freeze window expires following a completed tour.
 *
 * ── Escrow Model ─────────────────────────────────────────────────────────────
 * When a traveler pays:
 *   → Money goes into the PLATFORM's Stripe account (not guide's)
 *   → Payment.payoutStatus = Pending
 *
 * When guide marks tour COMPLETED (or auto-complete runs):
 *   → StripePaymentService.scheduleGuidePayoutFor() sets payoutEligibleAtUtc
 *
 * This job runs every hour and finds payments where:
 *   status       = Captured     (real money was collected)
 *   payoutStatus = Pending      (not yet transferred to guide)
 *   payoutEligibleAtUtc <= now  (freeze window has passed)
 *
 * For each eligible payment:
 *   → Stripe Transfer API moves (finalPrice - platformFee) to guide's account
 *   → payoutStatus = Transferred, stripeTransferId set
 *
 * ── Test / Demo Mode ─────────────────────────────────────────────────────────
 * Set app.payout.freeze-hours=0 in application.properties to make payouts
 * eligible immediately after completion.
 *
 * For the transfer destination, set guide_profiles.stripe_account_id to a
 * Stripe test connected account ID ("acct_test_...") created in Stripe Dashboard.
 *
 * If stripe_account_id is NULL (guide has not onboarded), the payout transitions
 * to Failed. The platform retains the funds until admin resolves it manually.
 *
 * ── Platform Fee ─────────────────────────────────────────────────────────────
 * Transfer amount = booking.finalPrice - booking.platformFeeSnapshot
 * The platform fee stays in the platform Stripe account as revenue.
 *
 * ── Stripe Connect Note ──────────────────────────────────────────────────────
 * This uses Stripe Transfer (platform-to-connected-account), NOT Stripe Payout
 * (connected-account-to-bank). The guide controls when to payout to their bank.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PayoutReleaseJob {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.mock-mode:false}")
    private boolean mockMode;

    /**
     * Runs every hour at minute 0 (e.g. 01:00, 02:00, 03:00...).
     * Finds all Captured payments whose payout freeze window has expired
     * and transfers the guide's earnings to their Stripe Connect account.
     *
     * For demo: set the cron to "0 * * * * *" (every minute) if needed,
     * combined with app.payout.freeze-hours=0 for instant demonstration.
     */
    @Scheduled(cron = "0 0 * * * *")   // every hour, at :00
    @Transactional
    public void releaseEligiblePayouts() {
        if (!mockMode) {
            Stripe.apiKey = stripeSecretKey;
        }

        List<Payment> eligible = paymentRepository.findEligiblePayouts(
                PayoutStatus.Pending,
                PaymentStatus.Captured,
                Instant.now()
        );

        if (eligible.isEmpty()) {
            log.debug("[PayoutJob] No eligible payouts found this cycle.");
            return;
        }

        log.info("[PayoutJob] Found {} eligible payout(s) to release.", eligible.size());

        for (Payment payment : eligible) {
            try {
                processOnePayout(payment);
            } catch (Exception e) {
                // Never let one failed payout stop the others
                log.error("[PayoutJob] Failed to process payout for PaymentID: {} — {}",
                        payment.getId(), e.getMessage());
            }
        }
    }

    private void processOnePayout(Payment payment) {
        Long bookingId = payment.getBooking().getId();

        // ── Get guide's Stripe account ────────────────────────────────────────
        String guideStripeAccountId = null;
        try {
            guideStripeAccountId = payment.getBooking()
                    .getOccurrence()
                    .getTemplate()
                    .getGuide()
                    .getStripeAccountId();
        } catch (Exception e) {
            log.warn("[PayoutJob] Could not resolve guide Stripe account for BookingID: {}", bookingId);
        }

        // If guide has no Stripe Connect account, mark as Failed and move on
        if (guideStripeAccountId == null || guideStripeAccountId.isBlank()) {
            payment.setPayoutStatus(PayoutStatus.Failed);
            paymentRepository.save(payment);
            log.warn("[PayoutJob] ❌ Guide has no Stripe account. BookingID: {} → PayoutStatus = Failed",
                    bookingId);
            return;
        }

        // ── Calculate payout amount ───────────────────────────────────────────
        // Guide receives: finalPrice - platformFeeSnapshot
        // The platform fee stays in the platform account as revenue.
        java.math.BigDecimal finalPrice   = payment.getBooking().getFinalPrice();
        java.math.BigDecimal platformFee  = payment.getBooking().getPlatformFeeSnapshot();
        java.math.BigDecimal guideEarning = finalPrice.subtract(
                platformFee != null ? platformFee : java.math.BigDecimal.ZERO);

        // Convert to smallest currency unit (cents for USD)
        long amountInCents = guideEarning
                .multiply(java.math.BigDecimal.valueOf(100))
                .longValue();

        String currency = (payment.getCurrency() != null
                ? payment.getCurrency() : "USD").toLowerCase();

        // ── Mock mode: simulate transfer without calling Stripe ───────────────
        if (mockMode) {
            String fakeTransferId = "mock_tr_" + java.util.UUID.randomUUID().toString().replace("-", "");
            payment.setPayoutStatus(PayoutStatus.Transferred);
            payment.setStripeTransferId(fakeTransferId);
            payment.setPayoutReleasedAtUtc(Instant.now());
            paymentRepository.save(payment);
            log.info("[PayoutJob MOCK] ✅ Simulated payout. BookingID: {}, Amount: {} {}, FakeTransferID: {}",
                    bookingId, guideEarning, currency.toUpperCase(), fakeTransferId);
            return;
        }

        // ── Call Stripe Transfer API ──────────────────────────────────────────
        try {
            TransferCreateParams params = TransferCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency)
                    // Destination: guide's Stripe Connect account
                    .setDestination(guideStripeAccountId)
                    // Source transaction links this transfer to the original payment
                    // (optional but improves reconciliation in Stripe Dashboard)
                    .putMetadata("bookingId", bookingId.toString())
                    .putMetadata("paymentId", payment.getId().toString())
                    .build();

            Transfer transfer = Transfer.create(params);

            // ── Mark payout as transferred ────────────────────────────────────
            payment.setPayoutStatus(PayoutStatus.Transferred);
            payment.setStripeTransferId(transfer.getId());
            payment.setPayoutReleasedAtUtc(Instant.now());
            paymentRepository.save(payment);

            log.info("[PayoutJob] ✅ Payout released. BookingID: {}, Amount: {} {}, TransferID: {}, GuideAccount: {}",
                    bookingId, guideEarning, currency.toUpperCase(),
                    transfer.getId(), guideStripeAccountId);

        } catch (StripeException e) {
            // Mark as Failed so admin can investigate — don't retry automatically
            // (prevents double-transfer if the error was actually on our side)
            payment.setPayoutStatus(PayoutStatus.Failed);
            paymentRepository.save(payment);

            log.error("[PayoutJob] ❌ Stripe Transfer failed for BookingID: {}. Error: {}",
                    bookingId, e.getMessage());
        }
    }
}
