package com.travelmarket.backend.chat.service;

import com.travelmarket.backend.booking.entity.Booking;
import com.travelmarket.backend.booking.repository.BookingRepository;
import com.travelmarket.backend.chat.dto.ConversationResponse;
import com.travelmarket.backend.chat.dto.InitiateConversationRequest;
import com.travelmarket.backend.chat.dto.MessageResponse;
import com.travelmarket.backend.chat.dto.ReadReceiptResponse;
import com.travelmarket.backend.chat.dto.SendMessageRequest;
import com.travelmarket.backend.chat.entity.Conversation;
import com.travelmarket.backend.chat.entity.Message;
import com.travelmarket.backend.chat.repository.ConversationRepository;
import com.travelmarket.backend.chat.repository.MessageRepository;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import com.travelmarket.backend.repository.TravelerProfileRepository;
import com.travelmarket.backend.repository.GuideProfileRepository;
import com.travelmarket.backend.entity.TravelerProfile;
import com.travelmarket.backend.entity.GuideProfile;
import com.travelmarket.backend.tour.entity.TourTemplate;
import com.travelmarket.backend.tour.repository.TourTemplateRepository;
import com.travelmarket.backend.notification.enums.NotificationType;
import com.travelmarket.backend.notification.service.NotificationService;
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
    private final TravelerProfileRepository travelerProfileRepository;
    private final GuideProfileRepository guideProfileRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        return conversationRepository.findByTravelerIdOrGuideIdOrderByUpdatedAtUtcDesc(userId, userId)
                .stream()
                .map(conv -> mapToConversationResponse(conv, userId))
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
    public ConversationResponse initiateConversation(Long userId, InitiateConversationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Conversation conversation = findOrCreateConversation(user, request.getTourId(), request.getBookingId());
        return mapToConversationResponse(conversation, userId);
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
        
        // Figure out recipient
        Long recipientId = senderId.equals(conversation.getTraveler().getId()) ? 
                conversation.getGuide().getId() : conversation.getTraveler().getId();
                
        notificationService.createNotification(
                recipientId,
                NotificationType.NEW_MESSAGE,
                "New Message",
                "You have a new message from " + sender.getFullName(),
                conversation.getId().toString(),
                "CONVERSATION"
        );

        // Emit to WebSocket so the other party sees it instantly if they have the chat open
        messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), response);

        return response;
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        Conversation conversation = getConversationAndVerifyAccess(conversationId, userId);
        
        java.time.Instant now = java.time.Instant.now();
        messageRepository.markAsRead(conversationId, userId, now);
        
        // Sync with notification service to clear in-app alerts
        notificationService.markAsReadByReference(userId, NotificationType.NEW_MESSAGE.name(), conversationId.toString());

        // Notify the SENDER that their messages were read
        Long senderToNotify = conversation.getTraveler().getId().equals(userId) ? 
                conversation.getGuide().getId() : conversation.getTraveler().getId();
        
        ReadReceiptResponse receipt = ReadReceiptResponse.builder()
                .conversationId(conversationId)
                .readAt(now)
                .readerId(userId)
                .build();
        
        messagingTemplate.convertAndSend("/topic/chat/" + conversationId, receipt);
    }

    private Conversation findOrCreateConversation(User sender, Long tourId, Long bookingId) {
        TourTemplate tour = null;
        if (tourId != null) {
            tour = tourTemplateRepository.findById(tourId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
        }

        Booking booking = null;
        Long travelerUserId = null;
        
        if (bookingId != null) {
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
            
            if (booking.getTraveler() == null || booking.getTraveler().getUser() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking data is inconsistent: missing traveler profile or user.");
            }
            if (booking.getOccurrence() == null || booking.getOccurrence().getTemplate() == null || 
                booking.getOccurrence().getTemplate().getGuide() == null || 
                booking.getOccurrence().getTemplate().getGuide().getUser() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking data is inconsistent: missing occurrence, template, or guide user.");
            }

            // Deduce tourId if missing
            if (tour == null) {
                tourId = booking.getOccurrence().getTemplate().getId();
                tour = booking.getOccurrence().getTemplate();
            }

            travelerUserId = booking.getTraveler().getUser().getId();
            User bookingGuide = booking.getOccurrence().getTemplate().getGuide().getUser();
            
            if (!sender.getId().equals(travelerUserId) && !sender.getId().equals(bookingGuide.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not belong to this booking");
            }
        }

        if (tour == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tourId is required when bookingId is not provided.");
        }

        // Deduce participant IDs. Since sender can be either a traveler or the guide themselves (though usually traveler initiates)
        if (tour.getGuide() == null || tour.getGuide().getUser() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tour data is inconsistent: missing guide profile or user.");
        }
        Long guideUserId = tour.getGuide().getUser().getId();
        if (travelerUserId == null) {
            travelerUserId = sender.getId().equals(guideUserId) ? null : sender.getId();
        }

        // If travelerUserId is null, it means the guide tried to initiate a chat with "nobody" using just a tour ID.
        if (travelerUserId == null && bookingId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chat initialization failed: Guides cannot initiate a tour-level conversation without a target traveler.");
        }

        // Try to find existing conversation specifically for THIS booking if provided
        if (booking != null) {
            Optional<Conversation> existingWithBooking = conversationRepository.findExactConversationWithBooking(travelerUserId, guideUserId, tourId, bookingId);
            if (existingWithBooking.isPresent()) {
                return existingWithBooking.get();
            }
        }

        // Try to find a pre-booking (general tour) conversation if no bookingId provided or no booking-specific chat exists
        Optional<Conversation> existingWithoutBooking = conversationRepository.findExactConversationWithoutBooking(travelerUserId, guideUserId, tourId);
        if (existingWithoutBooking.isPresent()) {
            Conversation conv = existingWithoutBooking.get();
            // If we have a booking now, attach it to the general conversation to promote it
            if (booking != null) {
                conv.setBooking(booking);
                return conversationRepository.save(conv);
            }
            return conv;
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

    private ConversationResponse mapToConversationResponse(Conversation conv, Long currentUserId) {
        ConversationResponse.ConversationResponseBuilder builder = ConversationResponse.builder()
                .id(conv.getId())
                .travelerId(conv.getTraveler().getId())
                .travelerName(conv.getTraveler().getFullName() != null ? conv.getTraveler().getFullName() : "Traveler")
                .guideId(conv.getGuide().getId())
                .guideName(conv.getGuide().getFullName() != null ? conv.getGuide().getFullName() : "Guide")
                .tourId(conv.getTour().getId())
                .tourTitle(conv.getTour().getTitle())
                .updatedAtUtc(conv.getUpdatedAtUtc());

        // Unread Count for current user
        builder.unreadCount(messageRepository.countByConversationIdAndSenderIdNotAndReadAtUtcIsNull(conv.getId(), currentUserId));

        // Fetch Last Message Content & Status
        messageRepository.findTopByConversationIdOrderByCreatedAtUtcDesc(conv.getId())
                .ifPresent(msg -> {
                    builder.lastMessageContent(msg.getContent());
                    // If the current user was the sender, did the OTHER party read it?
                    if (msg.getSender().getId().equals(currentUserId)) {
                        builder.lastMessageRead(msg.getReadAtUtc() != null);
                    } else {
                        // If the current user was the recipient, have WE read it?
                        builder.lastMessageRead(true); // From our perspective, we don't care about our own "seen" checkmark on incoming messages
                    }
                });

        // Fetch Traveler Profile
        travelerProfileRepository.findByUserId(conv.getTraveler().getId()).ifPresent(profile -> {
            builder.travelerProfileId(profile.getId());
            builder.travelerAvatarUrl(profile.getAvatarUrl());
            builder.travelerLoyaltyTier(profile.getLoyaltyTier());
            builder.travelerTripsCount(profile.getTotalCompletedTrips());
        });

        // Fetch Guide Profile
        guideProfileRepository.findByUserId(conv.getGuide().getId()).ifPresent(profile -> {
            builder.guideProfileId(profile.getId());
            builder.guideAvatarUrl(profile.getAvatarUrl());
            builder.guideIsVerified(profile.getIdVerified());
            builder.guideTripsCount(profile.getTotalGuidedTrips());
        });

        if (conv.getBooking() != null) {
            Booking b = conv.getBooking();
            builder.bookingId(b.getId());
            if (b.getStatus() != null) {
                builder.bookingStatus(b.getStatus().toString());
            }
            if (b.getOccurrence() != null) {
                builder.bookingStartTimeUtc(b.getOccurrence().getStartTimeUtc());
            }
            builder.peopleCount(b.getPeopleCount())
                   .totalPrice(b.getFinalPrice())
                   .currency(b.getCurrency());
        }

        return builder.build();
    }

    private MessageResponse mapToMessageResponse(Message msg) {
        return MessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversation().getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getFullName() != null ? msg.getSender().getFullName() : "User")
                .content(msg.getContent())
                .createdAtUtc(msg.getCreatedAtUtc())
                .readAtUtc(msg.getReadAtUtc())
                .build();
    }
}
