package com.chatapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String senderUsername;
    private String receiverUsername;
    private String content;
    private LocalDateTime timestamp;
    private String status;
}