package com.omni.backend.notification.application.event;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCompletedEvent {
    private UUID shopOrderId;
    private UUID shopId;
    private UUID customerId;
    private long vendorAmount;
    private Instant completedAt;
}
