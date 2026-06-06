package com.omni.backend.sales.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private UUID productId;
    private UUID skuId;
    private UUID shopId;
    private String productName;
    private String skuCode;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer quantity;
    private String imageUrl;
    private String shopName;
}
