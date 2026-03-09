package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.AdminAuditEventResponse;
import com.travelmarket.backend.entity.AdminAuditEvent;
import com.travelmarket.backend.repository.AdminAuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit-events")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditEventRepository repo;

    @GetMapping
    public Page<AdminAuditEventResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return repo.findAllByOrderByCreatedAtUtcDesc(PageRequest.of(page, size))
                .map(AdminAuditController::toDto);
    }

    @GetMapping("/target")
    public Page<AdminAuditEventResponse> byTarget(
            @RequestParam String type,
            @RequestParam Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return repo.findByTargetTypeAndTargetIdOrderByCreatedAtUtcDesc(type, id, PageRequest.of(page, size))
                .map(AdminAuditController::toDto);
    }

    private static AdminAuditEventResponse toDto(AdminAuditEvent e) {
        Long adminUserId = (e.getAdminUser() == null) ? null : e.getAdminUser().getId();
        String adminEmail = (e.getAdminUser() == null) ? null : e.getAdminUser().getEmail();

        return new AdminAuditEventResponse(
                e.getId(),
                e.getAction(),
                e.getTargetType(),
                e.getTargetId(),
                e.getSummary(),
                e.getDetailsJson(),
                e.getCreatedAtUtc(),
                adminUserId,
                adminEmail
        );
    }
}