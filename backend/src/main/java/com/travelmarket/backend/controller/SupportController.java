package com.travelmarket.backend.controller;

import com.travelmarket.backend.dto.request.SupportMessageRequest;
import com.travelmarket.backend.dto.request.SupportRequest;
import com.travelmarket.backend.entity.SupportMessage;
import com.travelmarket.backend.entity.SupportTicket;
import com.travelmarket.backend.repository.SupportMessageRepository;
import com.travelmarket.backend.repository.SupportTicketRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.EmailService;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Slf4j
public class SupportController {

    private final EmailService emailService;
    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${app.mail.from}")
    private String supportEmail;

    @PostMapping("/contact")
    public ResponseEntity<?> contactSupport(@Valid @RequestBody SupportRequest request) {
        log.info("Received support request from: {}", request.getEmail());

        // 1. Save to Database
        SupportTicket ticket = SupportTicket.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .priority(SupportTicket.TicketPriority.MEDIUM)
                .build();
        
        ticketRepository.save(ticket);

        // Save the initial message as well
        SupportMessage initialMsg = SupportMessage.builder()
                .ticket(ticket)
                .senderName(request.getName())
                .senderEmail(request.getEmail())
                .adminMessage(false)
                .content(request.getMessage())
                .build();
        messageRepository.save(initialMsg);

        // Send notification to admin
        String adminEmailHtml = String.format(
            "<h3>New Support Ticket: #%d</h3>" +
            "<p><strong>From:</strong> %s (%s)</p>" +
            "<p><strong>Subject:</strong> %s</p>" +
            "<hr/>" +
            "<div>%s</div>" +
            "<br/><p><a href='http://localhost:3000/dashboard/admin/support'>View in Admin Dashboard</a></p>",
            ticket.getId(), request.getName(), request.getEmail(), request.getSubject(), request.getMessage()
        );
        emailService.sendHtml(supportEmail, "New Support Ticket: " + request.getSubject(), adminEmailHtml);

        // Send in-app notifications to all admins
        userRepository.findByRole(User.Role.Admin).forEach(admin -> {
            notificationService.createNotificationInAppOnly(
                admin.getId(),
                NotificationType.NEW_MESSAGE,
                "New Support Ticket",
                "A new support ticket has been opened by " + request.getName() + " regarding " + request.getSubject(),
                ticket.getId().toString(),
                "SUPPORT_TICKET"
            );
        });

        // Send auto-reply to user
        String userEmailHtml = String.format(
            "<h3>Support Request Received (Ticket #%d)</h3>" +
            "<p>Hi %s,</p>" +
            "<p>We have received your support request regarding <strong>%s</strong>.</p>" +
            "<p>Our team will review your message and get back to you shortly. Here is a copy of your message:</p>" +
            "<blockquote style='border-left: 4px solid #ddd; padding-left: 10px; color: #555;'>%s</blockquote>" +
            "<p>Best regards,<br/>SafariHub Support Team</p>",
            ticket.getId(), request.getName(), request.getSubject(), request.getMessage()
        );
        emailService.sendHtml(request.getEmail(), "Support Request Received: " + request.getSubject(), userEmailHtml);

        return ResponseEntity.ok(Map.of(
            "message", "Support request sent successfully",
            "success", true,
            "ticketId", ticket.getId()
        ));
    }

    @GetMapping("/tickets/{id}/messages")
    public ResponseEntity<List<SupportMessage>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(messageRepository.findByTicketIdOrderByCreatedAtUtcAsc(id));
    }

    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<SupportMessage> sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody SupportMessageRequest request) {
        
        SupportTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        SupportMessage message = SupportMessage.builder()
                .ticket(ticket)
                .senderName(request.getName() != null ? request.getName() : ticket.getName())
                .senderEmail(request.getEmail() != null ? request.getEmail() : ticket.getEmail())
                .adminMessage(false)
                .content(request.getContent())
                .build();

        return ResponseEntity.ok(messageRepository.save(message));
    }
}
