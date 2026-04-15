package com.travelmarket.backend.notification.service;

import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.notification.dto.NotificationResponse;
import com.travelmarket.backend.notification.entity.Notification;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.repository.NotificationRepository;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.service.EmailService;
import com.travelmarket.backend.service.TimeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final EmailService emailService;
    // Centralized time service — use this instead of LocalDateTime.now() or Instant.now() inline
    private final TimeService timeService;

    /**
     * Creates or updates an in-app notification and sends an email.
     */
    @Async
    public void createNotification(Long userId, NotificationType type, String title, String message, String referenceId, String referenceType) {
        log.info("Processing notification for user {}: {}", userId, title);
        Notification notification;

        // SMART GROUPING: If it's a message, check if there's an existing unread notification for this chat
        if (type == NotificationType.NEW_MESSAGE && referenceId != null) {
            Optional<Notification> existing = notificationRepository.findByUserIdAndTypeAndReferenceIdAndReadFalse(userId, type, referenceId);
            if (existing.isPresent()) {
                notification = existing.get();
                notification.setCreatedAtUtc(timeService.getCurrentUtc()); // Refresh timestamp on group
                log.info("Grouping notification for chat {} (In-App row updated)", referenceId);
            } else {
                notification = Notification.builder()
                        .userId(userId)
                        .type(type)
                        .title(title)
                        .message(message)
                        .referenceId(referenceId)
                        .referenceType(referenceType)
                        .build();
            }
        } else {
            notification = Notification.builder()
                    .userId(userId)
                    .type(type)
                    .title(title)
                    .message(message)
                    .referenceId(referenceId)
                    .referenceType(referenceType)
                    .build();
        }

        // Save to DB (update existing or save new)
        notificationRepository.save(notification);
        
        // 1. WebSocket: Immediate UI update (Snappy experience)
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, mapToResponse(notification));
        } catch (Exception e) {
            log.warn("Failed to push WebSocket update for user {}: {}", userId, e.getMessage());
        }

        // 2. Email: Dispatch after UI update (Asynchronous background task)
        try {
            userRepository.findById(userId).ifPresent(user -> {
                String htmlBody = String.format(
                    "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                    "  <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>" +
                    "    <h2 style='color: #2563eb;'>%s</h2>" +
                    "    <p>Hello %s,</p>" +
                    "    <p>%s</p>" +
                    "    <div style='margin-top: 25px;'>" +
                    "       <a href='http://localhost:3000/dashboard/messages' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;'>View Message</a>" +
                    "    </div>" +
                    "    <div style='margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;'>" +
                    "      This is an automated notification from Travel Marketplace. Please do not reply to this email." +
                    "    </div>" +
                    "  </div>" +
                    "</body>" +
                    "</html>",
                    title, user.getFullName(), message
                );
                
                emailService.sendHtml(user.getEmail(), "New Message: " + title, htmlBody);
                log.info("Email notification queued for user {}", userId);
            });
        } catch (Exception e) {
            log.error("Failed to queue email notification for user {}: {}", userId, e.getMessage());
        }
    }

    public Page<NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdOrderByCreatedAtUtcDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public java.util.Map<String, Long> getUnreadCountsByCategory(Long userId) {
        return java.util.Map.of(
            "messages", notificationRepository.countUnreadMessages(userId),
            "bookings", notificationRepository.countUnreadBookings(userId)
        );
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Optional<Notification> opt = notificationRepository.findById(notificationId);
        if (opt.isPresent()) {
            Notification notification = opt.get();
            // Security check: ensure the notification belongs to the user
            if (notification.getUserId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            } else {
                log.warn("User {} attempted to mark notification {} as read, but they do not own it", userId, notificationId);
            }
        }
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void markBookingsAsRead(Long userId) {
        notificationRepository.markBookingsAsReadByUserId(userId);
    }

    @Transactional
    public void markAsReadByReference(Long userId, String typeStr, String refId) {
        try {
            NotificationType type = NotificationType.valueOf(typeStr);
            notificationRepository.markAsReadByUserIdTypeAndRef(userId, type, refId);
            log.info("Marked notifications as read by exact reference: user={}, type={}, refId={}", userId, type, refId);
        } catch (IllegalArgumentException e) {
            // Not an exact enum match, treat as prefix (e.g., BOOKING_)
            notificationRepository.markAsReadByUserIdTypePrefixAndRef(userId, typeStr, refId);
            log.info("Marked notifications as read by reference prefix: user={}, typePrefix={}, refId={}", userId, typeStr, refId);
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType())
                .createdAtUtc(notification.getCreatedAtUtc())
                .read(notification.isRead())
                .build();
    }
}
