package com.chatapp.backend.controller;

import com.chatapp.backend.entity.User;
import com.chatapp.backend.entity.UserStatus;
import com.chatapp.backend.repository.UserRepository;
import com.chatapp.backend.repository.UserStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/status")
public class StatusController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatusRepository userStatusRepository;

    @GetMapping("/{username}")
    public ResponseEntity<?> getStatus(@PathVariable String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        UserStatus status = userStatusRepository.findByUser(user).orElse(null);
        boolean online = status != null && status.isOnline();

        return ResponseEntity.ok(new java.util.HashMap<>() {{
            put("username", username);
            put("online", online);
            put("lastSeen", status != null ? status.getLastSeen() : null);
        }});
    }
}