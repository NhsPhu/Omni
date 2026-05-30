package com.omni.backend.finance.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.Immutable;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter(AccessLevel.NONE) // Protect against updates, it's immutable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Immutable // Mark as immutable in Hibernate
public class WalletTransactionJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "wallet_type", nullable = false, length = 10)
    private String walletType; // ADMIN | VENDOR

    @Column(name = "wallet_id", nullable = false)
    private UUID walletId;

    @Column(name = "shop_order_id")
    private UUID shopOrderId;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false)
    private long amount;

    @Column(name = "balance_after", nullable = false)
    private long balanceAfter;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
