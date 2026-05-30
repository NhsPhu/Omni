package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.WalletTransactionJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransactionJpaEntity, UUID> {
    Page<WalletTransactionJpaEntity> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);
}
