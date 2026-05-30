package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.VendorWalletJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorWalletRepository extends JpaRepository<VendorWalletJpaEntity, UUID> {
    Optional<VendorWalletJpaEntity> findByShopId(UUID shopId);
}
