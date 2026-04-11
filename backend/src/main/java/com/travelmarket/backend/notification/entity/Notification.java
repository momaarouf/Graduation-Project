package com.travelmarket.backend.notification.entity;

import com.travelmarket.backend.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // The recipient of the notification

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "reference_id")
    private String referenceId; // e.g., booking ID, message ID, tour ID for deep linking

    @Column(name = "reference_type")
    private String referenceType; // e.g., "BOOKING", "MESSAGE", "TOUR"

    @Column(name = "created_at_utc", nullable = false)
    private LocalDateTime createdAtUtc;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @PrePersist
    protected void onCreate() {
        if (this.createdAtUtc == null) {
            this.createdAtUtc = LocalDateTime.now(java.time.ZoneOffset.UTC);
        }
    }
}
