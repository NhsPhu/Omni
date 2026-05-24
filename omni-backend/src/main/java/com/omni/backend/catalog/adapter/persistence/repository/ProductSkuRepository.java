package com.omni.backend.catalog.adapter.persistence.repository;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductSkuRepository extends JpaRepository<ProductSkuJpaEntity, UUID> {
    List<ProductSkuJpaEntity> findByProductId(UUID productId);
}
