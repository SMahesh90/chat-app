package com.chatapp.backend.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.chatapp.backend.dto.ChatMessageRequest;
import com.chatapp.backend.dto.MessageDto;
import com.chatapp.backend.dto.TypingIndicatorDto;
import com.chatapp.backend.entity.Message;
import com.chatapp.backend.entity.User;
import com.chatapp.backend.repository.MessageRepository;
import com.chatapp.backend.repository.UserRepository;

@Controller
public class ChatWebSocketController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
   
    @MessageMapping("/chat.typing")
    public void handleTyping(TypingIndicatorDto dto, Principal principal) {
        String senderUsername = principal.getName();

        System.out.println("DEBUG: handleTyping called. Sender=" + senderUsername + 
                            ", receiverUsername=" + dto.getReceiverUsername() + 
                            ", typing=" + dto.isTyping());

        messagingTemplate.convertAndSendToUser(
            dto.getReceiverUsername(),
            "/queue/typing",
            new java.util.HashMap<>() {{
                put("username", senderUsername);
                put("typing", dto.isTyping());
            }}
        );
    }

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageRequest request, Principal principal) {
        String senderUsername = principal.getName();

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(request.getReceiverUsername())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        messageRepository.save(message);

        MessageDto dto = new MessageDto(
                message.getId(),
                sender.getUsername(),
                receiver.getUsername(),
                message.getContent(),
                message.getTimestamp(),
                message.getStatus().toString()
        );

        // Send to receiver's private queue
        messagingTemplate.convertAndSendToUser(receiver.getUsername(), "/queue/messages", dto);

        // Also send back to sender (so their own UI updates too)
        messagingTemplate.convertAndSendToUser(sender.getUsername(), "/queue/messages", dto);
    }
}