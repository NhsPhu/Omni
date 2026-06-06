package com.omni.backend.chat.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private UUID id;
    private UUID roomId;
    private UUID senderId;
    private String senderType; // 'USER' or 'SHOP'
    private String content;
    private Boolean isRead;
    private ZonedDateTime createdAt;
}
