package com.travelmarket.backend.chat.service;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.chat.dto.ConversationResponse;
import com.travelmarket.backend.chat.dto.MessageResponse;
import com.travelmarket.backend.chat.dto.SendMessageRequest;
import com.travelmarket.backend.chat.entity.Conversation;
import com.travelmarket.backend.chat.entity.Message;
import com.travelmarket.backend.chat.repository.ConversationRepository;
import com.travelmarket.backend.chat.repository.MessageRepository;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final TourTemplateRepository tourTemplateRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        return conversationRepository.findByTravelerIdOrGuideIdOrderByUpdatedAtUtcDesc(userId, userId)
                .stream()
                .map(this::mapToConversationResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getConversationMessages(Long conversationId, Long userId) {
        Conversation conversation = getConversationAndVerifyAccess(conversationId, userId);
        return messageRepository.findByConversationIdOrderByCreatedAtUtcAsc(conversation.getId())
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Conversation conversation;

        if (request.getConversationId() != null) {
            // Replying to existing
            conversation = getConversationAndVerifyAccess(request.getConversationId(), senderId);
        } else {
            // Initiating new (or loading existing conceptually equal conversation)
            if (request.getTourId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tourId is required to start a conversation.");
            }
            conversation = findOrCreateConversation(sender, request.getTourId(), request.getBookingId());
        }

        // Create the message
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(request.getContent());
        message = messageRepository.save(message);

        // Touch the conversation to bump it in the Inbox (updatedAtUtc handled by @PreUpdate)
        conversationRepository.save(conversation);

        MessageResponse response = mapToMessageResponse(message);

        // Emit to WebSocket so the other party sees it instantly if they have the chat open
        messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), response);

        return response;
    }

    private Conversation findOrCreateConversation(User sender, Long tourId, Long bookingId) {
        TourTemplate tour = tourTemplateRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        // Deduce participant IDs. Since sender can be either a traveler or the guide themselves (though usually traveler initiates)
        Long guideUserId = tour.getGuide().getUser().getId();
        Long travelerUserId = sender.getId().equals(guideUserId) ? null : sender.getId();

        // If travelerUserId is null, it means the guide tried to initiate a chat with "nobody" using just a tour ID.
        if (travelerUserId == null && bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guides cannot initiate a tour-level conversation without a target traveler.");
        }

        // If a booking is provided, we can strictly extract both parties and validate ownership
        Booking booking = null;
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            
            travelerUserId = booking.getTraveler().getUser().getId();
            User bookingGuide = booking.getOccurrence().getTemplate().getGuide().getUser();
            
            if (!sender.getId().equals(travelerUserId) && !sender.getId().equals(bookingGuide.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not belong to this booking");
            }
        }

        // Try to find existing
        Optional<Conversation> existing;
        if (bookingId != null) {
            existing = conversationRepository.findExactConversationWithBooking(travelerUserId, guideUserId, tourId, bookingId);
        } else {
            existing = conversationRepository.findExactConversationWithoutBooking(travelerUserId, guideUserId, tourId);
        }

        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new
        User travelerUser = userRepository.findById(travelerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Traveler not found"));
        User guideUser = userRepository.findById(guideUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guide not found"));

        Conversation conv = new Conversation();
        conv.setTraveler(travelerUser);
        conv.setGuide(guideUser);
        conv.setTour(tour);
        conv.setBooking(booking);

        return conversationRepository.save(conv);
    }

    private Conversation getConversationAndVerifyAccess(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conversation.getTraveler().getId().equals(userId) && !conversation.getGuide().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }

        return conversation;
    }

    private ConversationResponse mapToConversationResponse(Conversation conv) {
        return ConversationResponse.builder()
                .id(conv.getId())
                .travelerId(conv.getTraveler().getId())
                .travelerName(conv.getTraveler().getFullName() != null ? conv.getTraveler().getFullName() : "Traveler")
                .guideId(conv.getGuide().getId())
                .guideName(conv.getGuide().getFullName() != null ? conv.getGuide().getFullName() : "Guide")
                .tourId(conv.getTour().getId())
                .tourTitle(conv.getTour().getTitle())
                .bookingId(conv.getBooking() != null ? conv.getBooking().getId() : null)
                .updatedAtUtc(conv.getUpdatedAtUtc())
                .build();
    }

    private MessageResponse mapToMessageResponse(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getFullName() != null ? msg.getSender().getFullName() : "User")
                .content(msg.getContent())
                .createdAtUtc(msg.getCreatedAtUtc())
                .build();
    }
}
