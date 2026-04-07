package com.travelmarket.backend.payment.controller;

import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.payment.dto.response.GuideWalletResponse;
import com.travelmarket.backend.payment.dto.response.PaymentResponse;
import com.travelmarket.backend.payment.service.GuideEarningsService;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for guide wallet and earnings visibility.
 */
@RestController
@RequestMapping("/api/guide/earnings")
@RequiredArgsConstructor
public class GuideEarningsController {

    private final GuideEarningsService guideEarningsService;
    private final UserRepository userRepository;
    private final GuideProfileRepository guideProfileRepository;

    @GetMapping("/summary")
    public GuideWalletResponse getSummary(@AuthenticationPrincipal UserDetails principal) {
        ensureGuide(principal);
        return guideEarningsService.getWalletSummary(principal.getUsername());
    }

    @GetMapping("/payouts")
    public List<PaymentResponse> getPayouts(@AuthenticationPrincipal UserDetails principal) {
        ensureGuide(principal);
        return guideEarningsService.getPayoutHistory(principal.getUsername());
    }

    /**
     * Mock onboarding endpoint — for demo purposes, allows a guide to 
     * simulate linking their Stripe account.
     */
    @PostMapping("/mock-onboard")
    public Map<String, String> mockOnboard(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> data) {
        User user = ensureGuide(principal);
        GuideProfile gp = guideProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));
        
        // Generate a fake Stripe account ID
        gp.setStripeAccountId("acct_demo_" + java.util.UUID.randomUUID().toString().substring(0, 8));
        
        // Set professional payout details
        gp.setPayoutMethodBrand(data.getOrDefault("brand", "Visa"));
        gp.setPayoutMethodLast4(data.getOrDefault("last4", "4242"));
        gp.setPayoutMethodType(data.getOrDefault("type", "card"));
        
        guideProfileRepository.save(gp);
        
        return Map.of(
            "message", "Mock Stripe account linked successfully", 
            "accountId", gp.getStripeAccountId(),
            "brand", gp.getPayoutMethodBrand(),
            "last4", gp.getPayoutMethodLast4()
        );
    }

    private User ensureGuide(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.Role.Guide) {
            throw new AccessDeniedException("Only guides can access the earnings dashboard");
        }
        return user;
    }
}
