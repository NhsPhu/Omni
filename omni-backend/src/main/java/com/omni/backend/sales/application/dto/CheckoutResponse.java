package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CheckoutResponse {
    private UUID parentOrderId;
    private BigDecimal totalAmount;
    private BigDecimal finalAmount;
    private BigDecimal platformDiscount;
    private BigDecimal shippingDiscount;
    private String status;
}
