package com.omni.backend.sales.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class OrderPlacedEvent {
    private UUID parentOrderId;
    private UUID userId;
    private BigDecimal finalAmount;
}
