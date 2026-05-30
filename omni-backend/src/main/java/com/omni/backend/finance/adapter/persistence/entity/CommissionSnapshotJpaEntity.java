package com.omni.backend.finance.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Immutable;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "commission_snapshots")
@Getter
@Setter(AccessLevel.NONE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Immutable
public class CommissionSnapshotJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_order_id", nullable = false, unique = true)
    private UUID shopOrderId;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal commissionRate;

    @Column(name = "order_amount", nullable = false)
    private long orderAmount;

    @Column(name = "commission_amount", nullable = false)
    private long commissionAmount;

    @Column(name = "vendor_amount", nullable = false)
    private long vendorAmount;

    @Column(name = "settled_at")
    private ZonedDateTime settledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
