package com.omni.backend.finance.domain.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class OrderPaidEvent {
    private UUID parentOrderId;
    private UUID userId;
}
