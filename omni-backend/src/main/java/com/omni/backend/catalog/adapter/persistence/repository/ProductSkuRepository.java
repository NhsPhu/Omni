package com.omni.backend.catalog.adapter.persistence.repository;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductSkuRepository extends JpaRepository<ProductSkuJpaEntity, UUID> {
    List<ProductSkuJpaEntity> findByProductId(UUID productId);

    List<ProductSkuJpaEntity> findAllByIdIn(List<UUID> ids);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ProductSkuJpaEntity s SET s.stockQuantity = s.stockQuantity - :qty WHERE s.id = :id AND s.stockQuantity >= :qty")
    int deductStock(@org.springframework.data.repository.query.Param("id") UUID id, @org.springframework.data.repository.query.Param("qty") int qty);
}
