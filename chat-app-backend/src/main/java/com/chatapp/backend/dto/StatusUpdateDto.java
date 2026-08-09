package com.chatapp.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatusUpdateDto {
    private String username;
    private boolean online;
}