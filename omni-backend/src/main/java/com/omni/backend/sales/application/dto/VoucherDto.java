package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class VoucherDto {
    private UUID id;
    private String code;
    private String description;
    private BigDecimal discountPercent;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private UUID shopId;
    private ZonedDateTime expiryDate;
    private Boolean active;
}
