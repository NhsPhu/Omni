package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class UserVoucherDto {
    private UUID id; // This is the UserVoucher ID
    private UUID voucherId; // Platform or Shop voucher ID
    private String voucherType; // PLATFORM, SHOP
    private UUID shopId; // Null if platform
    private String category; // OMNI, SHIPPING (only for platform vouchers)
    private String code;
    private String discountType; // PERCENTAGE, FIXED_AMOUNT
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private ZonedDateTime validFrom;
    private ZonedDateTime validTo;
    private Boolean isUsed;
}
