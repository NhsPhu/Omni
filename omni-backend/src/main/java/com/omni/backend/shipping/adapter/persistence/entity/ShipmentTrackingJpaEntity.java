package com.omni.backend.shipping.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "shipment_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentTrackingJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_order_id", nullable = false)
    private UUID shopOrderId;

    @Column(name = "tracking_code", nullable = false, length = 100)
    private String trackingCode;

    @Column(name = "ghn_status", nullable = false, length = 50)
    private String ghnStatus;

    @Column(name = "status_name", length = 200)
    private String statusName;

    @Column(length = 500)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "occurred_at")
    private ZonedDateTime occurredAt;

    @Column(name = "received_at", updatable = false)
    @Builder.Default
    private ZonedDateTime receivedAt = ZonedDateTime.now();
}
