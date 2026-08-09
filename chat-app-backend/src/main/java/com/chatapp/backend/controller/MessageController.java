package com.chatapp.backend.controller;

import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.entity.Message;
import com.chatapp.backend.entity.User;
import com.chatapp.backend.repository.MessageRepository;
import com.chatapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
import com.chatapp.backend.dto.MarkReadRequest;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    // Get chat history between logged-in user and another user, paginated
    @GetMapping("/history/{otherUsername}")
    public ResponseEntity<?> getChatHistory(
            @PathVariable String otherUsername,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User otherUser = userRepository.findByUsername(otherUsername)
                .orElse(null);

        if (otherUser == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findConversation(currentUser, otherUser, pageable);

        List<MessageDto> result = messages.getContent().stream()
                .map(m -> new MessageDto(
                        m.getId(),
                        m.getSender().getUsername(),
                        m.getReceiver().getUsername(),
                        m.getContent(),
                        m.getTimestamp(),
                        m.getStatus().toString()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
    @PostMapping("/mark-read")
    public ResponseEntity<?> markAsRead(@RequestBody MarkReadRequest request, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findByUsername(request.getOtherUsername())
                .orElse(null);

        if (otherUser == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        messageRepository.markMessagesAsRead(otherUser, currentUser);

        return ResponseEntity.ok("Messages marked as read");
    }
}