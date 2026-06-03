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
}
