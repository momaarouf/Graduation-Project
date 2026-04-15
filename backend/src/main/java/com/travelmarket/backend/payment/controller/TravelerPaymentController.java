package com.travelmarket.backend.payment.controller;

import com.travelmarket.backend.entity.TravelerPaymentMethod;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.TravelerPaymentMethodRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traveler/payment-methods")
@RequiredArgsConstructor
public class TravelerPaymentController {

    private final TravelerPaymentMethodRepository paymentMethodRepository;
    private final TravelerProfileRepository travelerProfileRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<TravelerPaymentMethod> getMyPaymentMethods(@AuthenticationPrincipal UserDetails principal) {
        TravelerProfile profile = ensureTraveler(principal);
        return paymentMethodRepository.findByTravelerProfileId(profile.getId());
    }

    @PostMapping
    public TravelerPaymentMethod savePaymentMethod(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, Object> data) {
        TravelerProfile profile = ensureTraveler(principal);

        TravelerPaymentMethod method = new TravelerPaymentMethod();
        method.setTravelerProfile(profile);
        method.setLast4(data.get("last4").toString());
        method.setBrand(data.get("brand").toString());
        method.setCardholderName(data.get("cardholderName").toString());
        method.setExpiryMonth(Integer.parseInt(data.get("expiryMonth").toString()));
        method.setExpiryYear(Integer.parseInt(data.get("expiryYear").toString()));
        
        // If first card ever, force default
        long cardCount = paymentMethodRepository.countByTravelerProfileId(profile.getId());
        boolean isDefaultRequested = Boolean.parseBoolean(data.getOrDefault("isDefault", "false").toString());
        
        if (cardCount == 0) {
            method.setIsDefault(true);
        } else {
            method.setIsDefault(isDefaultRequested);
        }

        // If this is default, unset other defaults
        if (method.getIsDefault()) {
            List<TravelerPaymentMethod> existing = paymentMethodRepository.findByTravelerProfileId(profile.getId());
            existing.forEach(e -> e.setIsDefault(false));
            paymentMethodRepository.saveAll(existing);
        }

        return paymentMethodRepository.save(method);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        TravelerProfile profile = ensureTraveler(principal);
        TravelerPaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        // Ownership guard — a traveler may only delete their own cards
        if (!method.getTravelerProfile().getId().equals(profile.getId())) {
            throw new AccessDeniedException("Not authorized to delete this payment method");
        }

        // Guard: prevent double-deleting a card that was already soft-deleted
        if (method.getDeletedAtUtc() != null) {
            throw new AccessDeniedException("This payment method has already been removed");
        }

        boolean wasDefault = Boolean.TRUE.equals(method.getIsDefault());

        // Soft delete — set deletedAtUtc, NEVER physically remove the row.
        // Stripe payment method ID references on historical Payment records must remain intact.
        method.setDeletedAtUtc(Instant.now());
        method.setIsDefault(false); // Clear the default flag on this card
        paymentMethodRepository.save(method);

        // If the deleted card was the default, auto-promote the next oldest active card.
        // This prevents a traveler from having NO default card while still holding others.
        if (wasDefault) {
            List<TravelerPaymentMethod> remaining = paymentMethodRepository.findByTravelerProfileId(profile.getId());
            if (!remaining.isEmpty()) {
                // Pick the first card returned (already ordered newest-first by repository query)
                TravelerPaymentMethod newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                paymentMethodRepository.save(newDefault);
            }
        }

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    public TravelerPaymentMethod setDefault(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id) {
        TravelerProfile profile = ensureTraveler(principal);
        
        TravelerPaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        if (!method.getTravelerProfile().getId().equals(profile.getId())) {
            throw new AccessDeniedException("Not authorized to manage this payment method");
        }

        // Unset other defaults
        List<TravelerPaymentMethod> existing = paymentMethodRepository.findByTravelerProfileId(profile.getId());
        existing.forEach(e -> e.setIsDefault(false));
        paymentMethodRepository.saveAll(existing);

        method.setIsDefault(true);
        return paymentMethodRepository.save(method);
    }

    private TravelerProfile ensureTraveler(UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != User.Role.Traveler) {
            throw new AccessDeniedException("Only travelers can manage payment methods");
        }
        return travelerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Traveler profile not found"));
    }
}
