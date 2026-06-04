package com.omni.backend.finance.application.service;

import com.omni.backend.finance.application.dto.SystemReportDto;

import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    // Using basic repositories to construct the report.
    // In a real application, you would use custom JPQL/native queries for aggregation.
    
    private final ChildOrderRepository childOrderRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public SystemReportDto getSystemReport() {
        List<com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity> orders = childOrderRepository
                .findByCreatedAtGreaterThanEqualAndStatusNotIn(
                        java.time.ZonedDateTime.now().minusYears(10),
                        java.util.Arrays.asList("CANCELLED", "PENDING"));

        BigDecimal totalGmv = BigDecimal.ZERO;
        for (var order : orders) {
            totalGmv = totalGmv.add(order.getTotalAmount());
        }
        BigDecimal totalRevenue = totalGmv.multiply(new BigDecimal("0.05"));

        java.util.Map<java.util.UUID, BigDecimal> shopGmv = new java.util.HashMap<>();
        java.util.Map<java.util.UUID, Long> shopOrders = new java.util.HashMap<>();
        for (var order : orders) {
            shopGmv.put(order.getShopId(), shopGmv.getOrDefault(order.getShopId(), BigDecimal.ZERO).add(order.getTotalAmount()));
            shopOrders.put(order.getShopId(), shopOrders.getOrDefault(order.getShopId(), 0L) + 1);
        }

        List<SystemReportDto.TopShop> topShops = shopGmv.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> {
                    String shopName = shopRepository.findById(e.getKey())
                            .map(ShopJpaEntity::getName)
                            .orElse("Unknown Shop");
                    return new SystemReportDto.TopShop(shopName, e.getValue(), shopOrders.get(e.getKey()));
                })
                .toList();

        List<SystemReportDto.GmvData> chartData = new ArrayList<>();
        List<java.util.Map<String, Object>> daily = getPlatformDailyRevenue(7);
        for (var day : daily) {
            chartData.add(new SystemReportDto.GmvData(
                    (String) day.get("date"),
                    (BigDecimal) day.get("revenue"),
                    (BigDecimal) day.get("commission")
            ));
        }

        return SystemReportDto.builder()
                .totalGmv(totalGmv)
                .totalRevenue(totalRevenue)
                .activeShops(shopRepository.count())
                .totalOrders(childOrderRepository.count())
                .chartData(chartData)
                .topShops(topShops)
                .build();
    }

    public List<java.util.Map<String, Object>> getVendorDailyRevenue(java.util.UUID shopId, int days) {
        java.time.ZonedDateTime startDate = java.time.ZonedDateTime.now().minusDays(days);
        List<com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity> orders = childOrderRepository
                .findByShopIdAndCreatedAtGreaterThanEqualAndStatusNotIn(shopId, startDate, java.util.Arrays.asList("CANCELLED", "PENDING"));

        java.util.Map<String, java.util.Map<String, Object>> dailyData = new java.util.TreeMap<>();
        for (int i = days - 1; i >= 0; i--) {
            String date = java.time.ZonedDateTime.now().minusDays(i).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            java.util.Map<String, Object> dayStats = new java.util.HashMap<>();
            dayStats.put("date", date);
            dayStats.put("revenue", BigDecimal.ZERO);
            dayStats.put("orders", 0);
            dailyData.put(date, dayStats);
        }

        for (var order : orders) {
            String date = order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            if (dailyData.containsKey(date)) {
                java.util.Map<String, Object> stats = dailyData.get(date);
                stats.put("revenue", ((BigDecimal) stats.get("revenue")).add(order.getTotalAmount()));
                stats.put("orders", ((Integer) stats.get("orders")) + 1);
            }
        }

        return new ArrayList<>(dailyData.values());
    }

    public List<java.util.Map<String, Object>> getPlatformDailyRevenue(int days) {
        java.time.ZonedDateTime startDate = java.time.ZonedDateTime.now().minusDays(days);
        List<com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity> orders = childOrderRepository
                .findByCreatedAtGreaterThanEqualAndStatusNotIn(startDate, java.util.Arrays.asList("CANCELLED", "PENDING"));

        java.util.Map<String, java.util.Map<String, Object>> dailyData = new java.util.TreeMap<>();
        for (int i = days - 1; i >= 0; i--) {
            String date = java.time.ZonedDateTime.now().minusDays(i).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            java.util.Map<String, Object> dayStats = new java.util.HashMap<>();
            dayStats.put("date", date);
            dayStats.put("revenue", BigDecimal.ZERO);
            dayStats.put("commission", BigDecimal.ZERO);
            dayStats.put("orders", 0);
            dailyData.put(date, dayStats);
        }

        for (var order : orders) {
            String date = order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            if (dailyData.containsKey(date)) {
                java.util.Map<String, Object> stats = dailyData.get(date);
                stats.put("revenue", ((BigDecimal) stats.get("revenue")).add(order.getTotalAmount()));
                stats.put("commission", ((BigDecimal) stats.get("commission")).add(order.getTotalAmount().multiply(new BigDecimal("0.05")))); // 5% commission
                stats.put("orders", ((Integer) stats.get("orders")) + 1);
            }
        }

        return new ArrayList<>(dailyData.values());
    }
}
