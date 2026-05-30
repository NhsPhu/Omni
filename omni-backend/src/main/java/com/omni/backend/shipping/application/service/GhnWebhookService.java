package com.omni.backend.shipping.application.service;

import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.shipping.adapter.persistence.entity.ShipmentTrackingJpaEntity;
import com.omni.backend.shipping.adapter.persistence.repository.ShipmentTrackingRepository;
import com.omni.backend.shipping.application.dto.ghn.GhnCallbackPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class GhnWebhookService {

    private final ChildOrderRepository childOrderRepository;
    private final ShipmentTrackingRepository trackingRepository;
    private final DelayedQueueService delayedQueueService;
    // private final OrderStatusHistoryRepository orderStatusHistoryRepository; // Will add when available

    @Async
    public void processAsync(GhnCallbackPayload payload) {
        try {
            log.info("Processing GHN webhook async for tracking code: {}", payload.getOrderCode());

            ChildOrderJpaEntity shopOrder = childOrderRepository.findByTrackingCode(payload.getOrderCode());
            if (shopOrder == null) {
                log.warn("ShopOrder not found for tracking code: {}", payload.getOrderCode());
                return;
            }

            if (trackingRepository.existsByTrackingCodeAndGhnStatus(payload.getOrderCode(), payload.getStatus())) {
                log.info("Webhook already processed for status: {}", payload.getStatus());
                return;
            }

            ZonedDateTime occurredAt = Instant.ofEpochSecond(payload.getTime()).atZone(ZoneId.systemDefault());

            ShipmentTrackingJpaEntity tracking = ShipmentTrackingJpaEntity.builder()
                    .shopOrderId(shopOrder.getId())
                    .trackingCode(payload.getOrderCode())
                    .ghnStatus(payload.getStatus())
                    .statusName(payload.getStatusName())
                    .location(payload.getWarehouseLocation())
                    .note(payload.getDescription())
                    .occurredAt(occurredAt)
                    .build();
            trackingRepository.save(tracking);

            String newStatus = mapGhnStatus(payload.getStatus());
            if (newStatus == null || newStatus.equals(shopOrder.getStatus())) {
                return;
            }

            shopOrder.setStatus(newStatus);
            if ("DELIVERED".equals(newStatus)) {
                shopOrder.setDeliveredAt(occurredAt);
                ZonedDateTime autoCompleteAt = occurredAt.plusDays(7);
                shopOrder.setAutoCompleteAt(autoCompleteAt);
                delayedQueueService.schedule(shopOrder.getId(), autoCompleteAt.toInstant());
            }
            childOrderRepository.save(shopOrder);

            // orderStatusHistoryRepository.save(history);
            // eventPublisher.publishEvent(new OrderStatusChangedEvent(shopOrder, newStatus));

            log.info("Successfully processed GHN webhook. Order {} status changed to {}", shopOrder.getId(), newStatus);
        } catch (Exception e) {
            log.error("Error processing GHN webhook", e);
        }
    }

    private String mapGhnStatus(String ghnStatus) {
        switch (ghnStatus) {
            case "ready_to_pick":
            case "picking":
                return "SHIPPED";
            case "delivering":
                return "SHIPPING";
            case "delivered":
                return "DELIVERED";
            case "delivery_fail":
                return "SHIPPING"; 
            case "return":
                return "RETURNING";
            case "returned":
                return "RETURNED";
            case "cancel":
                return "CANCELLED";
            default:
                log.warn("Unknown GHN status: {}", ghnStatus);
                return null;
        }
    }
}
