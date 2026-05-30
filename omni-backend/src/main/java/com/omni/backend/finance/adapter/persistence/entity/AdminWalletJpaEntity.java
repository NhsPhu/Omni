package com.omni.backend.finance.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_wallet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminWalletJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "total_balance")
    @Builder.Default
    private long totalBalance = 0L;

    @Column(name = "pending_balance")
    @Builder.Default
    private long pendingBalance = 0L;

    @Column(name = "available_balance")
    @Builder.Default
    private long availableBalance = 0L;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
