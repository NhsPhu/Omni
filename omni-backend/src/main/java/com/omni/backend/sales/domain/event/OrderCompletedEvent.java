package com.omni.backend.sales.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OrderCompletedEvent {
    private final UUID userId;
    private final UUID orderId;
    private final BigDecimal totalAmount;
}
