package com.chatapp.backend.config;

import com.chatapp.backend.dto.StatusUpdateDto;
import com.chatapp.backend.entity.User;
import com.chatapp.backend.entity.UserStatus;
import com.chatapp.backend.repository.UserRepository;
import com.chatapp.backend.repository.UserStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.security.Principal;

@Component
public class WebSocketEventListener {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatusRepository userStatusRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();

        System.out.println("DEBUG: Session connected, principal = " + (principal != null ? principal.getName() : "NULL"));

        if (principal != null) {
            updateStatus(principal.getName(), true);
        }
    }
    
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();

        System.out.println("DEBUG: Session disconnected, principal = " + (principal != null ? principal.getName() : "NULL"));

        if (principal != null) {
            updateStatus(principal.getName(), false);
        }
    }

//    @EventListener
//    public void handleSessionConnected(SessionConnectedEvent event) {
//        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
//        Principal principal = accessor.getUser();
//
//        System.out.println("DEBUG: Session connected, principal = " + (principal != null ? principal.getName() : "NULL"));
//
//        if (principal != null) {
//            updateStatus(principal.getName(), true);
//        }
//    }
    private void updateStatus(String username, boolean online) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        UserStatus status = userStatusRepository.findByUser(user).orElse(new UserStatus());
        status.setUser(user);
        status.setOnline(online);
        status.setLastSeen(LocalDateTime.now());
        userStatusRepository.save(status);

        // Broadcast this status change to everyone subscribed (simplified: broadcast to a public topic)
        messagingTemplate.convertAndSend("/topic/status", new StatusUpdateDto(username, online));
    }
}