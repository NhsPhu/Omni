package com.omni.backend.finance.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "vendor_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorWalletJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_id", nullable = false, unique = true)
    private UUID shopId;

    @Column(name = "available_balance")
    @Builder.Default
    private long availableBalance = 0L;

    @Column(name = "pending_balance")
    @Builder.Default
    private long pendingBalance = 0L;

    @Column(name = "total_earned")
    @Builder.Default
    private long totalEarned = 0L;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
