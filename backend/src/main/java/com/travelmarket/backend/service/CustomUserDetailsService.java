package com.travelmarket.backend.service;

import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Soft-deleted users are treated as disabled.
        if (user.getDeletedAtUtc() != null) {
            throw new DisabledException("User is deactivated");
        }

        String status = user.getAccountStatus(); // ACTIVE / SUSPENDED / BANNED

        // Ban means permanent access termination.
        if ("BANNED".equalsIgnoreCase(status)) {
            throw new LockedException("User is banned");
        }

        // Suspension may be time-based or indefinite.
        if ("SUSPENDED".equalsIgnoreCase(status)) {
            // If until is null => indefinite suspension.
            // If until is in the future => still suspended.
            if (user.getSuspendedUntilUtc() == null || user.getSuspendedUntilUtc().isAfter(Instant.now())) {
                throw new AccountExpiredException("User is suspended");
            }
            // If until is in the past, allow login (cleanup job can later flip status to ACTIVE).
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();
    }
}