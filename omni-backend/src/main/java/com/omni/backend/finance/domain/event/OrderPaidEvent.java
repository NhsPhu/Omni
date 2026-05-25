package com.omni.backend.finance.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class OrderPaidEvent {
    private final UUID parentOrderId;
    private final UUID userId;
}
