package com.omni.backend.finance.application.service;

import com.omni.backend.finance.adapter.persistence.entity.SystemCommissionJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.SystemCommissionRepository;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService;
    private final SystemCommissionRepository commissionRepository;

    private static final BigDecimal PLATFORM_COMMISSION_RATE = new BigDecimal("5.00"); // 5%

    // Runs every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void processSettlements() {
        log.info("Starting daily settlement job...");
        
        // Find all COMPLETED orders. In a real app, you'd add an "is_settled" flag to avoid pulling all historical orders.
        // For simplicity, we just pull COMPLETED and check if commission already exists.
        List<ChildOrderJpaEntity> completedOrders = childOrderRepository.findAll().stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()))
                .toList();
                
        int settledCount = 0;

        for (ChildOrderJpaEntity order : completedOrders) {
            // Check if already settled
            if (commissionRepository.findByOrderId(order.getId()).isPresent()) {
                continue;
            }

            BigDecimal totalAmount = order.getTotalAmount();
            BigDecimal commissionAmount = totalAmount.multiply(PLATFORM_COMMISSION_RATE)
                                                     .divide(new BigDecimal("100"));
            BigDecimal vendorAmount = totalAmount.subtract(commissionAmount);

            // 1. Ghi nhận doanh thu cho hệ thống
            SystemCommissionJpaEntity commission = SystemCommissionJpaEntity.builder()
                    .vendorId(order.getShopId())
                    .orderId(order.getId())
                    .orderAmount(totalAmount)
                    .commissionRate(PLATFORM_COMMISSION_RATE)
                    .commissionAmount(commissionAmount)
                    .build();
            commissionRepository.save(commission);

            // 2. Chuyển tiền (95%) vào ví của Vendor
            walletService.credit(
                    order.getShopId(), 
                    vendorAmount, 
                    order.getId(), 
                    "Settlement for order " + order.getId()
            );

            settledCount++;
        }

        log.info("Settlement job finished. Settled {} orders.", settledCount);
    }
}
