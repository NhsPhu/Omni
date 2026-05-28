package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.OrderItemJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.OrderStatusHistoryJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.OrderStatusHistoryRepository;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final ParentOrderRepository parentOrderRepository;
    private final ChildOrderRepository childOrderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ProductSkuRepository productSkuRepository;

    @Transactional(readOnly = true)
    public List<ParentOrderJpaEntity> getUserOrders(UUID userId) {
        // Here we could return a DTO, but returning entity for simplicity in this demo
        // In real app, we should map to DTO to avoid lazy loading issues
        // Let's assume we have a custom finder or just fetch all and filter
        return parentOrderRepository.findAll().stream()
                .filter(o -> o.getUserId().equals(userId))
                .toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelUserOrder(UUID userId, UUID parentOrderId) {
        ParentOrderJpaEntity parentOrder = parentOrderRepository.findById(parentOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!parentOrder.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!"PENDING".equals(parentOrder.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled at this stage");
        }

        parentOrder.setStatus("CANCELLED");
        
        for (ChildOrderJpaEntity childOrder : parentOrder.getChildOrders()) {
            changeChildOrderStatus(childOrder, "CANCELLED", userId, "User cancelled");
            rollbackStock(childOrder);
        }

        parentOrderRepository.save(parentOrder);
        log.info("User {} cancelled order {}", userId, parentOrderId);
    }

    @Transactional(readOnly = true)
    public List<ChildOrderJpaEntity> getVendorOrders(UUID shopId) {
        return childOrderRepository.findByShopId(shopId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateVendorOrderStatus(UUID shopId, UUID childOrderId, String newStatus, UUID vendorUserId) {
        ChildOrderJpaEntity childOrder = childOrderRepository.findById(childOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!childOrder.getShopId().equals(shopId)) {
            throw new RuntimeException("Unauthorized");
        }

        validateStateMachine(childOrder.getStatus(), newStatus);

        changeChildOrderStatus(childOrder, newStatus, vendorUserId, "Vendor updated status");
        childOrderRepository.save(childOrder);
    }

    private void validateStateMachine(String currentStatus, String newStatus) {
        boolean valid = switch (currentStatus) {
            case "PENDING" -> newStatus.equals("PROCESSING") || newStatus.equals("CANCELLED");
            case "PROCESSING" -> newStatus.equals("SHIPPED") || newStatus.equals("CANCELLED");
            case "SHIPPED" -> newStatus.equals("DELIVERED") || newStatus.equals("RETURNED");
            case "DELIVERED" -> newStatus.equals("COMPLETED") || newStatus.equals("RETURNED");
            default -> false;
        };

        if (!valid) {
            throw new IllegalStateException("Invalid order status transition from " + currentStatus + " to " + newStatus);
        }
    }

    private void changeChildOrderStatus(ChildOrderJpaEntity childOrder, String newStatus, UUID changedBy, String note) {
        String oldStatus = childOrder.getStatus();
        childOrder.setStatus(newStatus);
        
        OrderStatusHistoryJpaEntity history = OrderStatusHistoryJpaEntity.builder()
                .orderId(childOrder.getId())
                .orderType("CHILD")
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedByUserId(changedBy)
                .note(note)
                .build();
        
        historyRepository.save(history);
    }

    private void rollbackStock(ChildOrderJpaEntity childOrder) {
        for (OrderItemJpaEntity item : childOrder.getItems()) {
            ProductSkuJpaEntity sku = productSkuRepository.findById(item.getSkuId())
                    .orElseThrow(() -> new RuntimeException("SKU not found"));
            sku.setStockQuantity(sku.getStockQuantity() + item.getQuantity());
            productSkuRepository.save(sku);
        }
    }

    // Runs every 5 minutes
    @Scheduled(fixedRate = 300000)
    @Transactional(rollbackFor = Exception.class)
    public void autoCancelPendingOrders() {
        ZonedDateTime fifteenMinsAgo = ZonedDateTime.now().minusMinutes(15);
        List<ParentOrderJpaEntity> pendingOrders = parentOrderRepository.findAll().stream()
                .filter(o -> "PENDING".equals(o.getStatus()) && o.getCreatedAt().isBefore(fifteenMinsAgo))
                .toList();

        for (ParentOrderJpaEntity order : pendingOrders) {
            order.setStatus("CANCELLED");
            for (ChildOrderJpaEntity childOrder : order.getChildOrders()) {
                changeChildOrderStatus(childOrder, "CANCELLED", null, "Auto-cancelled by system (unpaid > 15m)");
                rollbackStock(childOrder);
            }
            parentOrderRepository.save(order);
            log.info("Auto-cancelled unpaid order {}", order.getId());
        }
    }

    // Runs every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void autoCompleteOrders() {
        ZonedDateTime sevenDaysAgo = ZonedDateTime.now().minusDays(7);
        List<ChildOrderJpaEntity> deliveredOrders = childOrderRepository.findAll().stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()) && o.getUpdatedAt().isBefore(sevenDaysAgo))
                .toList();

        for (ChildOrderJpaEntity order : deliveredOrders) {
            changeChildOrderStatus(order, "COMPLETED", null, "Auto-completed by system (7 days past delivery)");
            childOrderRepository.save(order);
            log.info("Auto-completed child order {}", order.getId());
        }
    }
}
