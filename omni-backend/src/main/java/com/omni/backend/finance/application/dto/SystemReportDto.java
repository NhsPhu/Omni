package com.omni.backend.finance.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemReportDto {
    private BigDecimal totalGmv;
    private BigDecimal totalRevenue;
    private Long activeShops;
    private Long totalOrders;
    private List<GmvData> chartData;
    private List<TopShop> topShops;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GmvData {
        private String date;
        private BigDecimal gmv;
        private BigDecimal revenue;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopShop {
        private String name;
        private BigDecimal gmv;
        private Long orders;
    }
}
