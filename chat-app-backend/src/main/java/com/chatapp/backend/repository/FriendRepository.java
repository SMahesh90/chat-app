package com.chatapp.backend.repository;

import com.chatapp.backend.entity.Friend;
import com.chatapp.backend.entity.FriendStatus;
import com.chatapp.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findByUserAndStatus(User user, FriendStatus status);

    Optional<Friend> findByUserAndFriend(User user, User friend);

    List<Friend> findByFriendAndStatus(User friend, FriendStatus status);
}