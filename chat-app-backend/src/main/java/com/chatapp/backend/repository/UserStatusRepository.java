package com.chatapp.backend.repository;

import com.chatapp.backend.entity.User;
import com.chatapp.backend.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserStatusRepository extends JpaRepository<UserStatus, Long> {
    Optional<UserStatus> findByUser(User user);
}