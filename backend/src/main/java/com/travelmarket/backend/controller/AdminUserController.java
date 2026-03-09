package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AdminBanUserRequest;
import com.travelmarket.backend.dto.AdminSuspendUserRequest;
import com.travelmarket.backend.dto.AdminUserListResponse;
import com.travelmarket.backend.dto.AdminUserResponse;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.AdminAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    private User currentAdmin(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
    }

    /**
     * Optional filter by email substring. Useful for admin search.
     * If you don't have findByEmailContainingIgnoreCase in UserRepository, remove that part.
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
     */
    @PatchMapping("/{id}/deactivate")
    public AdminUserResponse deactivate(@PathVariable Long id, Authentication auth) {
        User admin = currentAdmin(auth);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        Instant oldDeletedAt = user.getDeletedAtUtc();

        if (user.getDeletedAtUtc() == null) {
            user.setDeletedAtUtc(Instant.now());
            userRepository.save(user);
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("oldDeletedAtUtc", oldDeletedAt);
        details.put("newDeletedAtUtc", user.getDeletedAtUtc());

        adminAuditService.log(
                admin,
                "USER_DEACTIVATE",
                "USER",
                user.getId(),
                "Deactivated user: " + user.getEmail(),
                details
        );

        return toDto(user);
    }

    /**
     * Undo soft delete.
     */
    @PatchMapping("/{id}/reactivate")
    public AdminUserResponse reactivate(@PathVariable Long id, Authentication auth) {
        User admin = currentAdmin(auth);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        Instant oldDeletedAt = user.getDeletedAtUtc();

        user.setDeletedAtUtc(null);
        userRepository.save(user);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("oldDeletedAtUtc", oldDeletedAt);
        details.put("newDeletedAtUtc", user.getDeletedAtUtc());

        adminAuditService.log(
                admin,
                "USER_REACTIVATE",
                "USER",
                user.getId(),
                "Reactivated user: " + user.getEmail(),
                details
        );

        return toDto(user);
    }

    /**
     * Suspend a user.
     * - untilUtc == null => indefinite suspension
     * - untilUtc != null => timed suspension
     */
    @PatchMapping("/{id}/suspend")
    public AdminUserResponse suspend(@PathVariable Long id,
                                     @Valid @RequestBody AdminSuspendUserRequest req,
                                     Authentication auth) {
        User admin = currentAdmin(auth);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        // Snapshot before changes
        String oldStatus = user.getAccountStatus();
        Instant oldUntil = user.getSuspendedUntilUtc();
        String oldReason = user.getStatusReason();

        // Rule: if timestamp provided, must be in the future.
        if (req.untilUtc() != null && !req.untilUtc().isAfter(Instant.now())) {
            throw new IllegalArgumentException("untilUtc must be in the future");
        }

        user.setAccountStatus("SUSPENDED");
        user.setStatusReason(req.reason().trim());
        user.setSuspendedUntilUtc(req.untilUtc());
        userRepository.save(user);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("oldStatus", oldStatus);
        details.put("newStatus", user.getAccountStatus());
        details.put("oldSuspendedUntilUtc", oldUntil);
        details.put("newSuspendedUntilUtc", user.getSuspendedUntilUtc());
        details.put("oldReason", oldReason);
        details.put("newReason", user.getStatusReason());

        adminAuditService.log(
                admin,
                "USER_SUSPEND",
                "USER",
                user.getId(),
                "Suspended user: " + user.getEmail(),
                details
        );

        return toDto(user);
    }

    /**
     * Activate user back to normal.
     * Clears suspension metadata and status reason.
     */
    @PatchMapping("/{id}/activate")
    public AdminUserResponse activate(@PathVariable Long id, Authentication auth) {
        User admin = currentAdmin(auth);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        // Snapshot before changes
        String oldStatus = user.getAccountStatus();
        Instant oldUntil = user.getSuspendedUntilUtc();
        String oldReason = user.getStatusReason();

        user.setAccountStatus("ACTIVE");
        user.setSuspendedUntilUtc(null);
        user.setStatusReason(null);
        userRepository.save(user);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("oldStatus", oldStatus);
        details.put("newStatus", user.getAccountStatus());
        details.put("oldSuspendedUntilUtc", oldUntil);
        details.put("newSuspendedUntilUtc", user.getSuspendedUntilUtc());
        details.put("oldReason", oldReason);
        details.put("newReason", user.getStatusReason());

        adminAuditService.log(
                admin,
                "USER_ACTIVATE",
                "USER",
                user.getId(),
                "Activated user: " + user.getEmail(),
                details
        );

        return toDto(user);
    }

    /**
     * Ban a user (terminate access permanently).
     */
    @PatchMapping("/{id}/ban")
    public AdminUserResponse ban(@PathVariable Long id,
                                 @Valid @RequestBody AdminBanUserRequest req,
                                 Authentication auth) {
        User admin = currentAdmin(auth);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        guardAdminActions(user, auth);

        if (req == null || req.reason() == null || req.reason().isBlank()) {
            throw new IllegalArgumentException("reason is required");
        }

        // Snapshot before changes
        String oldStatus = user.getAccountStatus();
        Instant oldUntil = user.getSuspendedUntilUtc();
        String oldReason = user.getStatusReason();

        user.setAccountStatus("BANNED");
        user.setStatusReason(req.reason().trim());
        user.setSuspendedUntilUtc(null);
        userRepository.save(user);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("oldStatus", oldStatus);
        details.put("newStatus", user.getAccountStatus());
        details.put("oldSuspendedUntilUtc", oldUntil);
        details.put("newSuspendedUntilUtc", user.getSuspendedUntilUtc());
        details.put("oldReason", oldReason);
        details.put("newReason", user.getStatusReason());

        adminAuditService.log(
                admin,
                "USER_BAN",
                "USER",
                user.getId(),
                "Banned user: " + user.getEmail(),
                details
        );

        return toDto(user);
    }

    /**
     * Prevent dangerous admin actions.
     * - Do not allow modifying other admins
     * - Do not allow modifying your own account status
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