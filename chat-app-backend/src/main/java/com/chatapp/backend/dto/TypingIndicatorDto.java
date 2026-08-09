package com.chatapp.backend.dto;

import lombok.Data;

@Data
public class TypingIndicatorDto {
    private String receiverUsername;
    private boolean typing;
}