package com.chatapp.backend.controller;

import com.chatapp.backend.dto.FriendRequestDto;
import com.chatapp.backend.dto.UserSummaryDto;
import com.chatapp.backend.entity.Friend;
import com.chatapp.backend.entity.FriendStatus;
import com.chatapp.backend.entity.User;
import com.chatapp.backend.repository.FriendRepository;
import com.chatapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRepository friendRepository;

    // Search users by username (excluding yourself)
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query, Authentication authentication) {
        String currentUsername = authentication.getName();

        List<UserSummaryDto> results = userRepository.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()))
                .filter(u -> !u.getUsername().equals(currentUsername))
                .map(u -> new UserSummaryDto(u.getId(), u.getUsername(), u.getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }

    // Send a friend request
    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDto dto, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User targetUser = userRepository.findByUsername(dto.getTargetUsername())
                .orElse(null);

        if (targetUser == null) {
            return ResponseEntity.badRequest().body("Target user not found");
        }

        if (targetUser.getId().equals(currentUser.getId())) {
            return ResponseEntity.badRequest().body("Cannot add yourself as a friend");
        }

        if (friendRepository.findByUserAndFriend(currentUser, targetUser).isPresent()) {
            return ResponseEntity.badRequest().body("Friend request already sent or already friends");
        }

        Friend friendRequest = new Friend();
        friendRequest.setUser(currentUser);
        friendRequest.setFriend(targetUser);
        friendRequest.setStatus(FriendStatus.PENDING);
        friendRepository.save(friendRequest);

        return ResponseEntity.ok("Friend request sent");
    }

    // Accept a friend request
    @PostMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@RequestBody FriendRequestDto dto, Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User requesterUser = userRepository.findByUsername(dto.getTargetUsername())
                .orElse(null);

        if (requesterUser == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Friend friendRequest = friendRepository.findByUserAndFriend(requesterUser, currentUser)
                .orElse(null);

        if (friendRequest == null) {
            return ResponseEntity.badRequest().body("No pending friend request from this user");
        }

        friendRequest.setStatus(FriendStatus.ACCEPTED);
        friendRepository.save(friendRequest);

        return ResponseEntity.ok("Friend request accepted");
    }

    // Get accepted friend list
    @GetMapping("/list")
    public ResponseEntity<?> getFriendList(Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSummaryDto> friends = friendRepository.findByUserAndStatus(currentUser, FriendStatus.ACCEPTED)
                .stream()
                .map(f -> new UserSummaryDto(f.getFriend().getId(), f.getFriend().getUsername(), f.getFriend().getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(friends);
    }

    // Get pending friend requests (received)
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(Authentication authentication) {
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSummaryDto> pending = friendRepository.findByFriendAndStatus(currentUser, FriendStatus.PENDING)
                .stream()
                .map(f -> new UserSummaryDto(f.getUser().getId(), f.getUser().getUsername(), f.getUser().getEmail()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pending);
    }
}