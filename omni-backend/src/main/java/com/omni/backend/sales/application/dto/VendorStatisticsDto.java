package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class VendorStatisticsDto {
    private BigDecimal totalRevenue;
    private long newOrdersCount;
    private long pendingOrdersCount;
    private double conversionRate;
    private long visitorsCount;
    private List<RevenueData> revenueChart;

    @Data
    @Builder
    public static class RevenueData {
        private String date;
        private BigDecimal revenue;
        private int orders;
    }
}
