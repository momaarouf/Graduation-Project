package com.travelmarket.backend.chat.controller;

import com.travelmarket.backend.chat.dto.ConversationResponse;
import com.travelmarket.backend.chat.dto.InitiateConversationRequest;
import com.travelmarket.backend.chat.dto.MessageResponse;
import com.travelmarket.backend.chat.dto.SendMessageRequest;
import com.travelmarket.backend.chat.service.ChatService;
import com.travelmarket.backend.entity.User;
import com.travelmarket.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public List<ConversationResponse> getConversations(@AuthenticationPrincipal UserDetails principal) {
        User user = getUserOrThrow(principal);
        return chatService.getUserConversations(user.getId());
    }

    @GetMapping("/messages/{conversationId}")
    public List<MessageResponse> getMessages(@PathVariable Long conversationId,
                                             @AuthenticationPrincipal UserDetails principal) {
        User user = getUserOrThrow(principal);
        return chatService.getConversationMessages(conversationId, user.getId());
    }

    @PostMapping("/send")
    public MessageResponse sendMessage(@Valid @RequestBody SendMessageRequest request,
                                       @AuthenticationPrincipal UserDetails principal) {
        User user = getUserOrThrow(principal);
        return chatService.sendMessage(user.getId(), request);
    }

    @PostMapping("/initiate")
    public ConversationResponse initiateConversation(@Valid @RequestBody InitiateConversationRequest request,
                                                     @AuthenticationPrincipal UserDetails principal) {
        User user = getUserOrThrow(principal);
        return chatService.initiateConversation(user.getId(), request);
    }

    @PostMapping("/conversations/{id}/read")
    public void markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        User user = getUserOrThrow(principal);
        chatService.markConversationAsRead(id, user.getId());
    }

    private User getUserOrThrow(UserDetails principal) {
        if (principal == null || principal.getUsername() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
