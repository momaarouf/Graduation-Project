package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.AdminAuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAuditEventRepository extends JpaRepository<AdminAuditEvent, Long> {
    Page<AdminAuditEvent> findByTargetTypeAndTargetIdOrderByCreatedAtUtcDesc(String targetType, Long targetId, Pageable pageable);
    Page<AdminAuditEvent> findAllByOrderByCreatedAtUtcDesc(Pageable pageable);
}