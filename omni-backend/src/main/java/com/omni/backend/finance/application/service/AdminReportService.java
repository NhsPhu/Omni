package com.omni.backend.finance.application.service;

import com.omni.backend.finance.application.dto.SystemReportDto;

import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
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

    public SystemReportDto getSystemReport() {
        // Mocking the complex aggregations for the purpose of this prototype
        List<SystemReportDto.GmvData> chartData = new ArrayList<>();
        chartData.add(new SystemReportDto.GmvData("20/05", new BigDecimal("25000000"), new BigDecimal("1250000")));
        chartData.add(new SystemReportDto.GmvData("21/05", new BigDecimal("32000000"), new BigDecimal("1600000")));
        chartData.add(new SystemReportDto.GmvData("22/05", new BigDecimal("45000000"), new BigDecimal("2250000")));
        chartData.add(new SystemReportDto.GmvData("23/05", new BigDecimal("51000000"), new BigDecimal("2550000")));

        List<SystemReportDto.TopShop> topShops = new ArrayList<>();
        topShops.add(new SystemReportDto.TopShop("Apple Store VN", new BigDecimal("125000000"), 1200L));
        topShops.add(new SystemReportDto.TopShop("Samsung Official", new BigDecimal("98000000"), 950L));

        return SystemReportDto.builder()
                .totalGmv(new BigDecimal("2910000000"))
                .totalRevenue(new BigDecimal("145500000"))
                .activeShops(1482L)
                .totalOrders(childOrderRepository.count())
                .chartData(chartData)
                .topShops(topShops)
                .build();
    }
}
