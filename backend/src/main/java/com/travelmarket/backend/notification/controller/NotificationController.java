package com.travelmarket.backend.notification.controller;

import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.notification.dto.NotificationResponse;
import com.travelmarket.backend.notification.service.NotificationService;
import com.travelmarket.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = getUserId(userDetails);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @GetMapping("/unread-categories")
    public ResponseEntity<Map<String, Long>> getUnreadCountsByCategory(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Map<String, Long> counts = notificationService.getUnreadCountsByCategory(userId);
        return ResponseEntity.ok(counts);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        Long userId = getUserId(userDetails);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-by-reference")
    public ResponseEntity<Void> markAsReadByReference(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String type,
            @RequestParam String referenceId) {
        
        Long userId = getUserId(userDetails);
        notificationService.markAsReadByReference(userId, type, referenceId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
