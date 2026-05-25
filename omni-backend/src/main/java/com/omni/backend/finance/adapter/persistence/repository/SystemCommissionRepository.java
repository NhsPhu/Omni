package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.SystemCommissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemCommissionRepository extends JpaRepository<SystemCommissionJpaEntity, UUID> {
    Optional<SystemCommissionJpaEntity> findByOrderId(UUID orderId);
}
