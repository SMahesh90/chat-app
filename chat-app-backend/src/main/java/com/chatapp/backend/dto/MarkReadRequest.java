package com.chatapp.backend.dto;

import lombok.Data;

@Data
public class MarkReadRequest {
    private String otherUsername;
}