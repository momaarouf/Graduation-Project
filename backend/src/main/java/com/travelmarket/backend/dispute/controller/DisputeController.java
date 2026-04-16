package com.travelmarket.backend.dispute.controller;

import com.travelmarket.backend.dispute.dto.request.AddDisputeResponseRequest;
import com.travelmarket.backend.dispute.dto.request.OpenDisputeRequest;
import com.travelmarket.backend.dispute.dto.request.ResolveDisputeRequest;
import com.travelmarket.backend.dispute.dto.response.DisputeResponse;
import com.travelmarket.backend.dispute.service.DisputeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    // --- Traveler / Guide Endpoints ---

    @PostMapping("/disputes")
    public ResponseEntity<DisputeResponse> openDispute(Principal principal, @Valid @RequestBody OpenDisputeRequest request) {
        return ResponseEntity.ok(disputeService.openDispute(principal.getName(), request));
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<DisputeResponse>> getMyDisputes(Principal principal) {
        return ResponseEntity.ok(disputeService.getMyDisputes(principal.getName()));
    }

    @GetMapping("/disputes/{id}")
    public ResponseEntity<DisputeResponse> getDisputeDetails(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(disputeService.getDisputeById(principal.getName(), id));
    }

    @PatchMapping("/disputes/{id}/response")
    public ResponseEntity<DisputeResponse> submitDisputeResponse(Principal principal, @PathVariable Long id, @Valid @RequestBody AddDisputeResponseRequest request) {
        return ResponseEntity.ok(disputeService.submitResponse(principal.getName(), id, request));
    }

    // --- Admin Endpoints ---

    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/admin/disputes")
    public ResponseEntity<Page<DisputeResponse>> getAllDisputesAdmin(Pageable pageable) {
        return ResponseEntity.ok(disputeService.getAllDisputes(pageable));
    }

    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/admin/disputes/{id}")
    public ResponseEntity<DisputeResponse> getDisputeDetailsAdmin(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(disputeService.getDisputeById(principal.getName(), id));
    }

    @PreAuthorize("hasRole('Admin')")
    @PatchMapping("/admin/disputes/{id}/review")
    public ResponseEntity<DisputeResponse> markUnderReviewAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(disputeService.markUnderReview(id));
    }

    @PreAuthorize("hasRole('Admin')")
    @PatchMapping("/admin/disputes/{id}/resolve")
    public ResponseEntity<DisputeResponse> resolveDisputeAdmin(@PathVariable Long id, @Valid @RequestBody ResolveDisputeRequest request) {
        return ResponseEntity.ok(disputeService.resolveDispute(id, request));
    }

    @PreAuthorize("hasRole('Admin')")
    @PatchMapping("/admin/disputes/{id}/reject")
    public ResponseEntity<DisputeResponse> rejectDisputeAdmin(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(disputeService.rejectDispute(id, reason));
    }
}
