package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.VendorWalletJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

@Repository
public interface VendorWalletRepository extends JpaRepository<VendorWalletJpaEntity, UUID> {
    Optional<VendorWalletJpaEntity> findByShopId(UUID shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM VendorWalletJpaEntity w WHERE w.shopId = :shopId")
    Optional<VendorWalletJpaEntity> findByShopIdLocked(@Param("shopId") UUID shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM VendorWalletJpaEntity w WHERE w.id = :id")
    Optional<VendorWalletJpaEntity> findByIdLocked(@Param("id") UUID id);
}
