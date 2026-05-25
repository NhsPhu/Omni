package com.omni.backend.sales.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "voucher_usages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherUsageJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "voucher_id", nullable = false)
    private UUID voucherId;

    @Column(name = "voucher_type", nullable = false, length = 20)
    private String voucherType; // PLATFORM, SHOP

    @CreationTimestamp
    @Column(name = "used_at", updatable = false)
    private ZonedDateTime usedAt;
}
