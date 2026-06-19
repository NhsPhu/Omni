package com.omni.backend.aichat.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class AiChatMessageDto {
    private UUID id;
    private UUID sessionId;
    private String senderType;
    private String content;
    private ZonedDateTime createdAt;
}
