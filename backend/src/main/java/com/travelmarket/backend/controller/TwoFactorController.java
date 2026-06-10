package com.travelmarket.backend.controller;

import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.security.TwoFactorAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final UserRepository userRepository;
    private final TwoFactorAuthService twoFactorAuthService;

    // We store the generated secret in the DB temporarily, but don't enable it yet.
    // That way, if they refresh the page, they just get a new one, until they confirm it.
    @PostMapping("/generate")
    public Map<String, String> generate2FA(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (Boolean.TRUE.equals(user.getIsTwoFactorEnabled())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "2FA is already enabled");
        }

        String secret = twoFactorAuthService.generateSecretKey();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        try {
            String qrCodeUri = twoFactorAuthService.getQrCodeImageUri(secret, user.getEmail());
            return Map.of("qrCodeUri", qrCodeUri, "secret", secret);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate QR code");
        }
    }

    @PostMapping("/enable")
    public void enable2FA(@AuthenticationPrincipal UserDetails principal, @RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code is required");
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (Boolean.TRUE.equals(user.getIsTwoFactorEnabled())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "2FA is already enabled");
        }

        String secret = user.getTwoFactorSecret();
        if (secret == null || secret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please generate a 2FA secret first");
        }

        boolean isValid = twoFactorAuthService.isOtpValid(secret, code);
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid 2FA code");
        }

        user.setIsTwoFactorEnabled(true);
        // We do NOT increment tokenVersion here, because setting up 2FA shouldn't log them out of current sessions immediately.
        userRepository.save(user);
    }

    @PostMapping("/disable")
    public void disable2FA(@AuthenticationPrincipal UserDetails principal, @RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current 2FA code is required to disable it");
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (!Boolean.TRUE.equals(user.getIsTwoFactorEnabled())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "2FA is not enabled");
        }

        boolean isValid = twoFactorAuthService.isOtpValid(user.getTwoFactorSecret(), code);
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid 2FA code");
        }

        user.setIsTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }
}
