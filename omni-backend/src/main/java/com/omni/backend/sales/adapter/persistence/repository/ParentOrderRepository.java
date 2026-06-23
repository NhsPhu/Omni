package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface ParentOrderRepository extends JpaRepository<ParentOrderJpaEntity, UUID> {
    
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"childOrders", "childOrders.items"})
    List<ParentOrderJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(oi.quantity) FROM ParentOrderJpaEntity po JOIN po.childOrders co JOIN co.items oi WHERE po.userId = :userId AND oi.skuId = :skuId AND po.createdAt BETWEEN :startTime AND :endTime AND po.status != 'CANCELLED'")
    Integer getPurchasedQuantityInTimeWindow(@org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("skuId") UUID skuId, @org.springframework.data.repository.query.Param("startTime") java.time.ZonedDateTime startTime, @org.springframework.data.repository.query.Param("endTime") java.time.ZonedDateTime endTime);
    
    List<ParentOrderJpaEntity> findByStatusAndCreatedAtBefore(String status, java.time.ZonedDateTime cutoff);
}
