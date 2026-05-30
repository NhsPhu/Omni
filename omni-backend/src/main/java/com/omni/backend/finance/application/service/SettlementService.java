package com.omni.backend.finance.application.service;

import com.omni.backend.finance.adapter.persistence.entity.CommissionSnapshotJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.CommissionSnapshotRepository;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettlementService {

    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService;
    private final CommissionSnapshotRepository commissionSnapshotRepository;

    public BigDecimal getCurrentCommissionRate() {
        return new BigDecimal("0.0500"); // 5% default
    }

    @Transactional
    public void settle(UUID shopOrderId) {
        // ChildOrderJpaEntity is equivalent to ShopOrder in the plan
        ChildOrderJpaEntity order = childOrderRepository.findById(shopOrderId)
                .orElseThrow(() -> new RuntimeException("ShopOrder not found"));

        // Guard 1: phải đúng trạng thái DELIVERED
        if (!"DELIVERED".equals(order.getStatus())) {
            log.warn("Settlement skipped: order {} is {}", shopOrderId, order.getStatus());
            return;
        }

        // Guard 2: chưa có commission snapshot
        if (commissionSnapshotRepository.existsByShopOrderId(shopOrderId)) {
            log.warn("Settlement skipped: snapshot already exists for {}", shopOrderId);
            return;
        }

        BigDecimal rate = getCurrentCommissionRate();
        
        long orderAmount = order.getTotalAmount().longValue(); 
        // Need to ensure getTotalAmount returns a value that can be mapped to long.
        // Assuming totalAmount is BigDecimal in ChildOrderJpaEntity, we convert to long.
        
        long commissionAmount = (long) (orderAmount * rate.doubleValue());
        long vendorAmount = orderAmount - commissionAmount;

        CommissionSnapshotJpaEntity snapshot = CommissionSnapshotJpaEntity.builder()
                .shopOrderId(shopOrderId)
                .commissionRate(rate)
                .orderAmount(orderAmount)
                .commissionAmount(commissionAmount)
                .vendorAmount(vendorAmount)
                .settledAt(java.time.ZonedDateTime.now())
                .build();
        commissionSnapshotRepository.save(snapshot);

        walletService.settleToVendor(shopOrderId, order.getShopId(), vendorAmount, commissionAmount);

        order.setStatus("COMPLETED");
        order.setCompletedAt(java.time.ZonedDateTime.now());
        childOrderRepository.save(order);
        
        // TODO: OrderStatusHistory record and Event publishing

        log.info("Settlement completed for shop_order {}", shopOrderId);
    }
}
