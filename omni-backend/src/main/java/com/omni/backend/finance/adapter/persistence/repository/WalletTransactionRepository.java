package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.WalletTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransactionJpaEntity, UUID> {
    List<WalletTransactionJpaEntity> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    @Query("SELECT COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount ELSE -t.amount END), 0) " +
           "FROM WalletTransactionJpaEntity t WHERE t.walletId = :walletId")
    BigDecimal calculateBalance(@Param("walletId") UUID walletId);
}
