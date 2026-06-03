package com.omni.backend.notification.application.event;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class OrderCompletedEvent {
    private UUID shopOrderId;
    private UUID shopId;
    private UUID customerId;
    private long vendorAmount;
    private Instant completedAt;
}
