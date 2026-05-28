package com.omni.backend.catalog.adapter.persistence.repository;

import com.omni.backend.catalog.adapter.persistence.entity.ProductJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductJpaEntity, UUID> {
    Page<ProductJpaEntity> findByShopId(UUID shopId, Pageable pageable);

    @Query("SELECT p FROM ProductJpaEntity p WHERE p.deletedAt IS NULL AND p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<ProductJpaEntity> findNewestProducts(Pageable pageable);

    @Query("SELECT p FROM ProductJpaEntity p WHERE p.deletedAt IS NULL AND p.status = 'ACTIVE' ORDER BY p.reviewCount DESC")
    List<ProductJpaEntity> findBestSellerProducts(Pageable pageable);

    @Query("SELECT p FROM ProductJpaEntity p, ProductSkuJpaEntity s WHERE p.id = s.productId AND p.deletedAt IS NULL AND p.status = 'ACTIVE' GROUP BY p.id, p.shopId, p.categoryId, p.name, p.slug, p.description, p.avgRating, p.reviewCount, p.status, p.deletedAt, p.createdAt, p.updatedAt ORDER BY MIN(s.price) ASC")
    List<ProductJpaEntity> findCheapestProducts(Pageable pageable);
}
