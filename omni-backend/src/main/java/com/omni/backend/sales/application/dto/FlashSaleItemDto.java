package com.omni.backend.sales.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemDto {
    private UUID id;
    private UUID eventId;
    private UUID productId;
    private UUID skuId;
    private UUID shopId;
    private BigDecimal flashPrice;
    private BigDecimal originalPrice;
    private Integer flashStock;
    private Integer soldCount;
    private String status;
    private Integer sortOrder;
    private ZonedDateTime createdAt;

    // Enriched fields for frontend display
    private String productName;
    private String productImage;
    private String shopName;
    private String skuCode;
}
