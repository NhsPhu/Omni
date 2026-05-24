package com.omni.backend.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSkuDto {
    private UUID id;
    private String skuCode;
    private BigDecimal price;
    private Integer stockQuantity;
    private Map<String, String> attributes;
}
