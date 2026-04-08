package com.travelmarket.backend.chat.repository;

import com.travelmarket.backend.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Fetch all conversations for a specific user (whether they are the guide or traveler), ordered by the latest message.
    List<Conversation> findByTravelerIdOrGuideIdOrderByUpdatedAtUtcDesc(Long travelerId, Long guideId);

    // Find an existing conversation about a specific booking
    @Query("SELECT c FROM Conversation c WHERE c.traveler.id = :travelerId AND c.guide.id = :guideId AND c.tour.id = :tourId AND c.booking.id = :bookingId")
    Optional<Conversation> findExactConversationWithBooking(@Param("travelerId") Long travelerId, @Param("guideId") Long guideId, @Param("tourId") Long tourId, @Param("bookingId") Long bookingId);

    // Find an existing conversation about a tour (PRE-BOOKING)
    @Query("SELECT c FROM Conversation c WHERE c.traveler.id = :travelerId AND c.guide.id = :guideId AND c.tour.id = :tourId AND c.booking IS NULL")
    Optional<Conversation> findExactConversationWithoutBooking(@Param("travelerId") Long travelerId, @Param("guideId") Long guideId, @Param("tourId") Long tourId);
}
