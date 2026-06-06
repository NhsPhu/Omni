package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class VendorOrderDto {
    private UUID id;
    private UUID shopId;
    private String status;
    private BigDecimal totalAmount;
    private String trackingCode;
    private String ghnOrderCode;
    private String customerName;
    private ZonedDateTime createdAt;
    private ZonedDateTime shippedAt;
    private ZonedDateTime deliveredAt;
    private ZonedDateTime completedAt;
    private String returnReason;
}
