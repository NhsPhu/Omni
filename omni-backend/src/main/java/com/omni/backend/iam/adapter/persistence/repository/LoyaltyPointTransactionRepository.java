package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyPointTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface LoyaltyPointTransactionRepository extends JpaRepository<LoyaltyPointTransactionJpaEntity, UUID> {
    List<LoyaltyPointTransactionJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
