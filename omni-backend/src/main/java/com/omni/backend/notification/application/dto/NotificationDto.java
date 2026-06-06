package com.omni.backend.notification.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationDto {
    private UUID id;
    private String title;
    private String message;
    private String type;
    private String payload;
    private boolean isRead;
    private ZonedDateTime createdAt;
}
