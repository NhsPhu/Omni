package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.Optional;

@Repository
public interface PlatformVoucherRepository extends JpaRepository<PlatformVoucherJpaEntity, UUID> {
    Optional<PlatformVoucherJpaEntity> findByCode(String code);
}
