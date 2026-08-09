package com.chatapp.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.chatapp.backend.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.chatapp.backend.entity.Message;
import com.chatapp.backend.entity.User;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.timestamp DESC")
    Page<Message> findConversation(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.status = 'READ' WHERE m.sender = :sender AND m.receiver = :receiver AND m.status != 'READ'")
    void markMessagesAsRead(@Param("sender") User sender, @Param("receiver") User receiver);
}