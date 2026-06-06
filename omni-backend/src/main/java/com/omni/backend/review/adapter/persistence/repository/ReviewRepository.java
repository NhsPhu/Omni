package com.omni.backend.review.adapter.persistence.repository;

import com.omni.backend.review.adapter.persistence.entity.ProductReviewJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<ProductReviewJpaEntity, UUID> {
    
    Page<ProductReviewJpaEntity> findByProductIdAndStatus(UUID productId, String status, Pageable pageable);
    
    Page<ProductReviewJpaEntity> findByShopId(UUID shopId, Pageable pageable);
    
    boolean existsByUserIdAndProductIdAndOrderItemId(UUID userId, UUID productId, UUID orderItemId);

    @Query("SELECT AVG(r.rating) FROM ProductReviewJpaEntity r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Double getAverageRatingByProductId(@Param("productId") UUID productId);

    @Query("SELECT COUNT(r) FROM ProductReviewJpaEntity r WHERE r.productId = :productId AND r.status = 'APPROVED'")
    Long countApprovedReviewsByProductId(@Param("productId") UUID productId);
}
