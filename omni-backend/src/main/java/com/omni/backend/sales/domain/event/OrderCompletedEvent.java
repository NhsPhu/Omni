package com.omni.backend.sales.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OrderCompletedEvent {
    private UUID userId;
    private UUID orderId;
    private BigDecimal totalAmount;
}
