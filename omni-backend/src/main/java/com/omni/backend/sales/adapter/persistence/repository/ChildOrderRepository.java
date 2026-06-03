package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChildOrderRepository extends JpaRepository<ChildOrderJpaEntity, UUID> {
    List<ChildOrderJpaEntity> findByShopId(UUID shopId);
    List<ChildOrderJpaEntity> findByParentOrderId(UUID parentOrderId);
    ChildOrderJpaEntity findByTrackingCode(String trackingCode);
    
    List<ChildOrderJpaEntity> findByShopIdAndCreatedAtGreaterThanEqualAndStatusNotIn(UUID shopId, java.time.ZonedDateTime startDate, java.util.Collection<String> statuses);
    List<ChildOrderJpaEntity> findByCreatedAtGreaterThanEqualAndStatusNotIn(java.time.ZonedDateTime startDate, java.util.Collection<String> statuses);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT c FROM ChildOrderJpaEntity c WHERE c.id = :id")
    java.util.Optional<ChildOrderJpaEntity> findByIdLocked(@org.springframework.data.repository.query.Param("id") UUID id);
}
