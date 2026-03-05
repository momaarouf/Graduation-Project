package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AdminBanUserRequest;
import com.travelmarket.backend.dto.AdminSuspendUserRequest;
import com.travelmarket.backend.dto.AdminUserListResponse;
import com.travelmarket.backend.dto.AdminUserResponse;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;

    /**
     * Optional filter by email substring. Useful for admin search.
     */
    @GetMapping
    public AdminUserListResponse list(@RequestParam(required = false) String email) {
        List<User> users = (email == null || email.isBlank())
                ? userRepository.findAll()
                : userRepository.findByEmailContainingIgnoreCase(email.trim());

        List<AdminUserResponse> dto = users.stream().map(AdminUserController::toDto).toList();
        return new AdminUserListResponse(dto);
    }

    @GetMapping("/{id}")
    public AdminUserResponse get(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    /**
     * Soft delete / archive.
     * This should not be used as "terminate". Terminate is ban.
     */
    @PatchMapping("/{id}/deactivate")
    public AdminUserResponse deactivate(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        if (user.getDeletedAtUtc() == null) {
            user.setDeletedAtUtc(Instant.now());
            userRepository.save(user);
        }

        return toDto(user);
    }

    /**
     * Undo soft delete. Recommended for admin panels.
     */
    @PatchMapping("/{id}/reactivate")
    public AdminUserResponse reactivate(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        user.setDeletedAtUtc(null);
        userRepository.save(user);
        return toDto(user);
    }

    /**
     * Suspend a user.
     * - untilUtc == null => indefinite suspension (manual activate required)
     * - untilUtc != null => timed suspension (access automatically restored after time passes)
     */
    @PatchMapping("/{id}/suspend")
    public AdminUserResponse suspend(@PathVariable Long id,
                                     @Valid @RequestBody AdminSuspendUserRequest req,
                                     Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        // Business rule: if a timestamp is provided, it must be in the future.
        if (req.untilUtc() != null && !req.untilUtc().isAfter(Instant.now())) {
            throw new IllegalArgumentException("untilUtc must be in the future");
        }

        user.setAccountStatus("SUSPENDED");
        user.setStatusReason(req.reason().trim());
        user.setSuspendedUntilUtc(req.untilUtc());
        userRepository.save(user);

        return toDto(user);
    }

    /**
     * Activate user back to normal.
     * Clears suspension metadata and ban metadata.
     * Does not clear deletedAtUtc (that is reactivate).
     */
    @PatchMapping("/{id}/activate")
    public AdminUserResponse activate(@PathVariable Long id, Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        user.setAccountStatus("ACTIVE");
        user.setSuspendedUntilUtc(null);
        user.setStatusReason(null);
        userRepository.save(user);

        return toDto(user);
    }

    /**
     * Ban a user (terminate access permanently).
     * Data stays for audit and disputes.
     */
    @PatchMapping("/{id}/ban")
    public AdminUserResponse ban(@PathVariable Long id,
                                 @Valid @RequestBody AdminBanUserRequest req,
                                 Authentication auth) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        if (req == null || req.reason() == null || req.reason().isBlank()) {
            throw new IllegalArgumentException("reason is required");
        }

        user.setAccountStatus("BANNED");
        user.setStatusReason(req.reason().trim());
        user.setSuspendedUntilUtc(null);
        userRepository.save(user);

        return toDto(user);
    }

    /**
     * Prevent dangerous admin actions.
     * - Do not allow modifying other admins.
     * - Do not allow modifying your own account status (avoids locking yourself out).
     */
    private void guardAdminActions(User target, Authentication auth) {
        if (target.getRole() == User.Role.Admin) {
            throw new RuntimeException("You cannot modify another admin.");
        }

        if (auth != null && auth.getName() != null && target.getEmail() != null) {
            String adminEmail = auth.getName().trim().toLowerCase();
            String targetEmail = target.getEmail().trim().toLowerCase();
            if (adminEmail.equals(targetEmail)) {
                throw new RuntimeException("You cannot modify your own account status.");
            }
        }
    }

    /**
     * Convert entity to admin DTO.
     * Never include passwordHash.
     */
    private static AdminUserResponse toDto(User u) {
        return new AdminUserResponse(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getPhoneE164(),
                u.getRole().name(),
                u.getIsEmailVerified(),
                u.getProfileCompleted(),
                u.getAccountStatus(),
                u.getSuspendedUntilUtc(),
                u.getStatusReason(),
                u.getPreferredLanguage(),
                u.getTimezone(),
                u.getCreatedAtUtc(),
                u.getDeletedAtUtc()
        );
    }
}