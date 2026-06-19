package com.omni.backend.aichat.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class AiChatSessionDto {
    private UUID id;
    private UUID userId;
    private UUID shopId;
    private String status;
    private ZonedDateTime updatedAt;
}
