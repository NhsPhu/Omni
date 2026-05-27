package com.omni.backend.catalog.adapter.persistence.repository;

import com.omni.backend.catalog.adapter.persistence.entity.WishlistJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistJpaEntity, UUID> {
    List<WishlistJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<WishlistJpaEntity> findByUserIdAndProductId(UUID userId, UUID productId);
    void deleteByUserIdAndProductId(UUID userId, UUID productId);
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}
