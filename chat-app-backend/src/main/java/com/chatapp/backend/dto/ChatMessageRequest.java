package com.chatapp.backend.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String receiverUsername;
    private String content;
}