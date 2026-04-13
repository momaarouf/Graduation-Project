package com.travelmarket.backend.chat.repository;

import com.travelmarket.backend.chat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch all messages for a specific conversation, ordered chronologically.
    List<Message> findByConversationIdOrderByCreatedAtUtcAsc(Long conversationId);

    // Fetch the most recent message for a conversation.
    Optional<Message> findTopByConversationIdOrderByCreatedAtUtcDesc(Long conversationId);

    // Count unread messages for a user in a conversation (where they are NOT the sender)
    long countByConversationIdAndSenderIdNotAndReadAtUtcIsNull(Long conversationId, Long userId);

    // Find all unread messages for a user in a conversation to mark them as seen
    List<Message> findByConversationIdAndSenderIdNotAndReadAtUtcIsNull(Long conversationId, Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.readAtUtc = :now WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.readAtUtc IS NULL")
    void markAsRead(@Param("conversationId") Long conversationId, 
                    @Param("userId") Long userId, 
                    @Param("now") Instant now);
}
