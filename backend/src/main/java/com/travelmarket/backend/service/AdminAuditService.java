package com.travelmarket.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelmarket.backend.entity.AdminAuditEvent;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.AdminAuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditEventRepository repo;

    /**
     * Inject Spring's configured ObjectMapper.
     * This avoids issues serializing Java time types like Instant.
     */
    private final ObjectMapper objectMapper;

    public void log(User admin, String action, String targetType, Long targetId, String summary, Object details) {
        AdminAuditEvent e = new AdminAuditEvent();
        e.setAdminUser(admin);
        e.setAction(action);
        e.setTargetType(targetType);
        e.setTargetId(targetId);
        e.setSummary(summary);
        e.setCreatedAtUtc(Instant.now());

        if (details != null) {
            try {
                e.setDetailsJson(objectMapper.writeValueAsString(details));
            } catch (Exception ex) {
                // Never fail the main admin action because audit serialization failed
                e.setDetailsJson("{\"error\":\"failed_to_serialize_details\"}");
            }
        }

        repo.save(e);
    }
}