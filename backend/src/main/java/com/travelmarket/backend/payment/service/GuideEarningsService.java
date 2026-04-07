package com.travelmarket.backend.payment.service;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.payment.dto.response.GuideWalletResponse;
import com.travelmarket.backend.payment.dto.response.PaymentResponse;
import com.travelmarket.backend.payment.entity.Payment;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import com.travelmarket.backend.payment.repository.PaymentRepository;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing guide earnings and payout visibility.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GuideEarningsService {

    private final PaymentRepository paymentRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;

    /**
     * Aggregates financial status for a guide's wallet dashboard.
     */
    @Transactional(readOnly = true)
    public GuideWalletResponse getWalletSummary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        List<Payment> payments = paymentRepository.findAllByGuideId(gp.getId());

        BigDecimal available = BigDecimal.ZERO;
        BigDecimal pending = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        for (Payment p : payments) {
            if (p.getStatus() != PaymentStatus.Captured) continue;

            BigDecimal net = calculateNetEarnings(p);
            
            if (p.getPayoutStatus() == PayoutStatus.Transferred) {
                available = available.add(net);
            } else if (p.getPayoutStatus() == PayoutStatus.Pending) {
                pending = pending.add(net);
            }
            
            total = total.add(net);
        }

        return GuideWalletResponse.builder()
                .availableBalance(available)
                .pendingBalance(pending)
                .totalEarned(total)
                .currency(payments.isEmpty() ? "USD" : payments.get(0).getCurrency())
                .stripeAccountId(gp.getStripeAccountId())
                .onboardingComplete(gp.getStripeAccountId() != null && !gp.getStripeAccountId().isBlank())
                .payoutMethodLast4(gp.getPayoutMethodLast4())
                .payoutMethodBrand(gp.getPayoutMethodBrand())
                .payoutMethodType(gp.getPayoutMethodType())
                .build();
    }

    /**
     * Lists recent payouts / earnings events.
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayoutHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        return paymentRepository.findAllByGuideId(gp.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BigDecimal calculateNetEarnings(Payment p) {
        BigDecimal finalPrice = p.getBooking().getFinalPrice();
        BigDecimal platformFee = p.getBooking().getPlatformFeeSnapshot();
        return finalPrice.subtract(platformFee != null ? platformFee : BigDecimal.ZERO);
    }

    private PaymentResponse mapToResponse(Payment p) {
        return PaymentResponse.builder()
                .paymentId(p.getId())
                .bookingId(p.getBooking().getId())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .payoutStatus(p.getPayoutStatus() != null ? p.getPayoutStatus().name() : null)
                .amount(calculateNetEarnings(p)) // Show net earnings to the guide
                .currency(p.getCurrency())
                .checkoutUrl(null) // Not relevant for payouts
                .sessionId(p.getStripeSessionId())
                .payoutEligibleAt(p.getPayoutEligibleAtUtc())
                .payoutReleasedAt(p.getPayoutReleasedAtUtc())
                .authorizedAt(p.getAuthorizedAtUtc())
                .capturedAt(p.getCapturedAtUtc())
                .createdAt(p.getCreatedAtUtc())
                .build();
    }
}
