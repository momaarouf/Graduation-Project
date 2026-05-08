package com.travelmarket.backend.payment.service;

import com.travelmarket.backend.dto.AdminPayoutResponse;
import com.travelmarket.backend.dto.AdminPayoutSummaryResponse;
import com.travelmarket.backend.payment.entity.Payment;
import com.travelmarket.backend.payment.enums.PaymentStatus;
import com.travelmarket.backend.payment.enums.PayoutStatus;
import com.travelmarket.backend.payment.repository.PaymentRepository;
import com.travelmarket.backend.service.TimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPayoutService {

    private final PaymentRepository paymentRepository;
    private final TimeService timeService;

    @Transactional(readOnly = true)
    public List<AdminPayoutResponse> getAllPayouts() {
        return paymentRepository.findAll().stream()
                .map(this::mapToAdminResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminPayoutSummaryResponse getPayoutSummary() {
        List<Payment> all = paymentRepository.findAll();
        Instant now = timeService.getCurrentUtc();

        long pending = 0;
        long frozen = 0;
        long completed = 0;
        long failed = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalFees = BigDecimal.ZERO;

        for (Payment p : all) {
            if (p.getStatus() != PaymentStatus.Captured) continue;

            String status = determineStatus(p, now);
            if ("pending".equals(status)) pending++;
            else if ("frozen".equals(status)) frozen++;
            else if ("completed".equals(status)) completed++;
            else if ("failed".equals(status)) failed++;

            totalAmount = totalAmount.add(p.getAmountCaptured());
            BigDecimal fee = p.getBooking().getPlatformFeeSnapshot();
            if (fee != null) totalFees = totalFees.add(fee);
        }

        return AdminPayoutSummaryResponse.builder()
                .totalPending(pending)
                .totalFrozen(frozen)
                .totalCompleted(completed)
                .totalFailed(failed)
                .totalAmount(totalAmount)
                .totalFees(totalFees)
                .averageProcessingTime("4.2 hours") // Mocked for now
                .build();
    }

    private AdminPayoutResponse mapToAdminResponse(Payment p) {
        Instant now = timeService.getCurrentUtc();
        BigDecimal gross = p.getAmountAuthorized();
        BigDecimal fee = p.getBooking().getPlatformFeeSnapshot() != null 
                ? p.getBooking().getPlatformFeeSnapshot() 
                : BigDecimal.ZERO;
        
        return AdminPayoutResponse.builder()
                .id(p.getId())
                .payoutId("PO-" + p.getId())
                .guideId(p.getBooking().getOccurrence().getTemplate().getGuide().getId())
                .guideName(p.getBooking().getOccurrence().getTemplate().getGuide().getUser().getFullName())
                .guideEmail(p.getBooking().getOccurrence().getTemplate().getGuide().getUser().getEmail())
                .guideAvatar(null) // Not storing avatar in DB yet
                .amount(gross)
                .currency(p.getCurrency())
                .status(determineStatus(p, now))
                .method(p.getBooking().getOccurrence().getTemplate().getGuide().getPayoutMethodType() != null 
                        ? p.getBooking().getOccurrence().getTemplate().getGuide().getPayoutMethodType().toLowerCase() 
                        : "stripe")
                .methodDetails(p.getBooking().getOccurrence().getTemplate().getGuide().getPayoutMethodLast4() != null 
                        ? "**** " + p.getBooking().getOccurrence().getTemplate().getGuide().getPayoutMethodLast4() 
                        : "Account Pending")
                .tourId(p.getBooking().getOccurrence().getTemplate().getId())
                .tourTitle(p.getBooking().getOccurrence().getTemplate().getTitle())
                .bookingId(p.getBooking().getId())
                .platformFee(fee)
                .guideEarnings(gross.subtract(fee))
                .feeTier("standard") // TODO: Implement tier logic
                .feeMultiplier(p.getBooking().getOccurrence().getTemplate().getGuide().getCurrentFeeMultiplier())
                .requestedAt(p.getCreatedAtUtc())
                .processedAt(p.getCapturedAtUtc())
                .completedAt(p.getPayoutReleasedAtUtc())
                .estimatedRelease(p.getPayoutEligibleAtUtc())
                .build();
    }

    private String determineStatus(Payment p, Instant now) {
        if (p.getStatus() != PaymentStatus.Captured) return "cancelled";
        if (p.getPayoutStatus() == PayoutStatus.Transferred) return "completed";
        if (p.getPayoutStatus() == PayoutStatus.Failed) return "failed";
        
        if (p.getPayoutEligibleAtUtc() == null) return "pending";
        if (p.getPayoutEligibleAtUtc().isAfter(now)) return "frozen";
        return "pending";
    }
}
