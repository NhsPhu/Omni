package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChildOrderRepository extends JpaRepository<ChildOrderJpaEntity, UUID> {
    List<ChildOrderJpaEntity> findByShopId(UUID shopId);
}
