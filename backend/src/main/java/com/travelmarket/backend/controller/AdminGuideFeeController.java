package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.UpdateGuideFeeMultiplierRequest;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.AdminAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Admin endpoints for managing guide platform fee adjustments.
 *
 * The global base rate is configured via {@code app.loyalty.platform-fee-rate}
 * in application.properties. This controller allows admins to adjust the
 * per-guide multiplier ({@code GuideProfile.currentFeeMultiplier}) to reward
 * top performers or penalize underperforming/high-risk guides.
 *
 * Effective fee = base rate × multiplier.
 * Example: base = 10%, multiplier = 0.90 → effective = 9% (reward for top guide).
 *
 * Security: all endpoints are restricted to Admin role via SecurityConfig.
 * Route prefix: /api/admin/guides
 */
@RestController
@RequestMapping("/api/admin/guides")
@RequiredArgsConstructor
@Slf4j
public class AdminGuideFeeController {

    private final GuideProfileRepository guideProfileRepository;
    private final UserRepository userRepository;
    private final AdminAuditService adminAuditService;

    /**
     * Update the platform fee multiplier for a specific guide.
     *
     * PATCH /api/admin/guides/{guideProfileId}/fee-multiplier
     *
     * Body: { "multiplier": 0.90, "reason": "Top performer Q1 2026" }
     *
     * Constraints (enforced by {@link UpdateGuideFeeMultiplierRequest}):
     *   - Minimum: 0.50 (guide pays 50% of base rate — for exceptional performers)
     *   - Maximum: 1.50 (guide pays 150% of base rate — for high-risk or policy violation)
     *
     * The change is audit-logged with the old and new multiplier values
     * so admins can review the history later.
     *
     * @param guideProfileId  ID of the guide's profile record (not user ID)
     * @param request         contains new multiplier value and optional reason note
     * @param auth            authenticated admin performing the action
     * @return a confirmation map with old and new multiplier values
     */
    @PatchMapping("/{guideProfileId}/fee-multiplier")
    public Map<String, Object> updateFeeMultiplier(
            @PathVariable Long guideProfileId,
            @Valid @RequestBody UpdateGuideFeeMultiplierRequest request,
            Authentication auth) {

        // Resolve the admin user submitting this change (for audit logging)
        User admin = resolveAdmin(auth);

        // Fetch the guide profile — guide profile ID, not user ID
        GuideProfile guide = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Guide profile not found with id: " + guideProfileId));

        // Snapshot old value before mutation (for audit record)
        BigDecimal oldMultiplier = guide.getCurrentFeeMultiplier() != null
                ? guide.getCurrentFeeMultiplier()
                : BigDecimal.ONE;

        // Apply the new multiplier (validation already done by Bean Validation at request level)
        guide.setCurrentFeeMultiplier(request.getMultiplier());
        guideProfileRepository.save(guide);

        log.info("[AdminFee] Guide {} fee multiplier updated: {} → {} by admin {} (reason: {})",
                guideProfileId, oldMultiplier, request.getMultiplier(),
                admin.getEmail(), request.getReason() != null ? request.getReason() : "none");

        // Audit log — stored in admin_audit_events for compliance traceability
        Map<String, Object> auditDetails = new LinkedHashMap<>();
        auditDetails.put("guideProfileId", guide.getId());
        auditDetails.put("guideUserId", guide.getUser() != null ? guide.getUser().getId() : null);
        auditDetails.put("guideEmail", guide.getUser() != null ? guide.getUser().getEmail() : null);
        auditDetails.put("oldFeeMultiplier", oldMultiplier);
        auditDetails.put("newFeeMultiplier", request.getMultiplier());
        auditDetails.put("reason", request.getReason());

        adminAuditService.log(
                admin,
                "GUIDE_FEE_MULTIPLIER_UPDATE",
                "GUIDE_PROFILE",
                guide.getId(),
                "Updated guide platform fee multiplier",
                auditDetails
        );

        // Return a human-readable confirmation with old/new values
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("guideProfileId", guide.getId());
        response.put("guideEmail", guide.getUser() != null ? guide.getUser().getEmail() : null);
        response.put("oldFeeMultiplier", oldMultiplier);
        response.put("newFeeMultiplier", request.getMultiplier());
        response.put("effectiveAt", java.time.Instant.now().toString());
        response.put("note", request.getReason() != null ? request.getReason() : "No reason provided");
        return response;
    }

    /**
     * GET /api/admin/guides/{guideProfileId}/fee-multiplier
     *
     * Returns the current fee multiplier for inspection without modifying it.
     * Useful for admin dashboards to audit the current state.
     */
    @GetMapping("/{guideProfileId}/fee-multiplier")
    public Map<String, Object> getFeeMultiplier(@PathVariable Long guideProfileId) {
        GuideProfile guide = guideProfileRepository.findById(guideProfileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Guide profile not found with id: " + guideProfileId));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("guideProfileId", guide.getId());
        response.put("guideEmail", guide.getUser() != null ? guide.getUser().getEmail() : null);
        response.put("currentFeeMultiplier", guide.getCurrentFeeMultiplier() != null
                ? guide.getCurrentFeeMultiplier()
                : BigDecimal.ONE);
        return response;
    }

    /** Resolves and validates the authenticated admin making the request. */
    private User resolveAdmin(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin user not found"));
    }
}
