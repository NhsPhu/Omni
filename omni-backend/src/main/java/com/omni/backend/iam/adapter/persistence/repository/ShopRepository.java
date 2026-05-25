package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<ShopJpaEntity, UUID> {
    Page<ShopJpaEntity> findByStatus(String status, Pageable pageable);
}
