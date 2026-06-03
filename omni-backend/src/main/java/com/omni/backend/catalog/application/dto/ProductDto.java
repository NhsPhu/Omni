package com.omni.backend.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private UUID shopId;
    private UUID categoryId;
    private String name;
    private String slug;
    private String description;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private String status;
    private String shopName;
    private String shopLocation;
    private List<ProductSkuDto> skus;
    private List<ProductImageDto> images;
}
