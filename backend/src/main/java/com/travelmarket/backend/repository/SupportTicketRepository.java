package com.travelmarket.backend.repository;

import com.travelmarket.backend.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByOrderByCreatedAtUtcDesc();
    List<SupportTicket> findByStatusOrderByCreatedAtUtcDesc(SupportTicket.TicketStatus status);
}
