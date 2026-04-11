package com.travelmarket.backend.notification.repository;

import com.travelmarket.backend.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtUtcDesc(Long userId, Pageable pageable);
    
    java.util.Optional<Notification> findByUserIdAndTypeAndReferenceIdAndReadFalse(Long userId, com.travelmarket.backend.notification.enums.NotificationType type, String referenceId);

    @Query("SELECT " +
           "(SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false AND n.referenceId IS NULL) + " +
           "(SELECT COUNT(DISTINCT n.referenceId) FROM Notification n WHERE n.userId = :userId AND n.read = false AND n.referenceId IS NOT NULL)")
    long countByUserIdAndReadFalse(@Param("userId") Long userId);
 
    @Query("SELECT COUNT(DISTINCT n.referenceId) FROM Notification n WHERE n.userId = :userId AND n.read = false AND n.type = com.travelmarket.backend.notification.enums.NotificationType.NEW_MESSAGE")
    long countUnreadMessages(@Param("userId") Long userId);
 
    @Query("SELECT COUNT(DISTINCT n.referenceId) FROM Notification n WHERE n.userId = :userId AND n.read = false AND CAST(n.type AS string) LIKE 'BOOKING_%'")
    long countUnreadBookings(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.type = :type AND n.referenceId = :refId")
    void markAsReadByUserIdTypeAndRef(@Param("userId") Long userId, @Param("type") com.travelmarket.backend.notification.enums.NotificationType type, @Param("refId") String refId);
 
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND CAST(n.type AS string) LIKE CONCAT(:typePrefix, '%') AND n.referenceId = :refId")
    void markAsReadByUserIdTypePrefixAndRef(@Param("userId") Long userId, @Param("typePrefix") String typePrefix, @Param("refId") String refId);
}
