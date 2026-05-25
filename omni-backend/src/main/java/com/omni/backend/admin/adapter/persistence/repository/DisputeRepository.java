package com.omni.backend.admin.adapter.persistence.repository;

import com.omni.backend.admin.adapter.persistence.entity.DisputeJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<DisputeJpaEntity, UUID> {
    Page<DisputeJpaEntity> findByStatus(String status, Pageable pageable);
}
