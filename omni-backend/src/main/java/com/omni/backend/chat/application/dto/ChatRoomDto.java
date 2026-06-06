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
public class ChatRoomDto {
    private UUID id;
    private UUID userId;
    private UUID shopId;
    private String userName; // To display in Shop Inbox
    private String shopName; // To display in User Inbox
    private String lastMessage;
    private ZonedDateTime lastMessageAt;
    private Integer unreadCount; // To display unread badges
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
