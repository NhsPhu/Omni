package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class SkuPerformanceDto {
    private String key;
    private String sku;
    private String name;
    private long views;
    private long cart;
    private long ordered;
    private BigDecimal revenue;
    private double refundRate;
    private int stock;
}
