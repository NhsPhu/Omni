package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.CommissionSnapshotJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CommissionSnapshotRepository extends JpaRepository<CommissionSnapshotJpaEntity, UUID> {
    boolean existsByShopOrderId(UUID shopOrderId);
}
