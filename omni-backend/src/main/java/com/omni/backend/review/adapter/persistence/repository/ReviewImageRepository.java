package com.omni.backend.review.adapter.persistence.repository;

import com.omni.backend.review.adapter.persistence.entity.ReviewImageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImageJpaEntity, UUID> {
    List<ReviewImageJpaEntity> findByReviewId(UUID reviewId);
}
