package com.omni.backend.finance.application.service;

import com.omni.backend.finance.adapter.persistence.entity.WalletJpaEntity;
import com.omni.backend.finance.adapter.persistence.entity.WalletTransactionJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.WalletRepository;
import com.omni.backend.finance.adapter.persistence.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;

    @Transactional
    public WalletJpaEntity getOrCreateWallet(UUID vendorId) {
        return walletRepository.findByVendorId(vendorId)
                .orElseGet(() -> {
                    WalletJpaEntity wallet = WalletJpaEntity.builder()
                            .vendorId(vendorId)
                            .currency("VND")
                            .build();
                    return walletRepository.save(wallet);
                });
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(UUID vendorId) {
        WalletJpaEntity wallet = getOrCreateWallet(vendorId);
        return transactionRepository.calculateBalance(wallet.getId());
    }

    @Transactional
    public void credit(UUID vendorId, BigDecimal amount, UUID referenceOrderId, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be positive");
        }
        
        WalletJpaEntity wallet = getOrCreateWallet(vendorId);
        
        WalletTransactionJpaEntity tx = WalletTransactionJpaEntity.builder()
                .walletId(wallet.getId())
                .type("CREDIT")
                .amount(amount)
                .referenceOrderId(referenceOrderId)
                .description(description)
                .build();
                
        transactionRepository.save(tx);
        log.info("Credited {} to wallet {}, refOrder={}", amount, wallet.getId(), referenceOrderId);
    }

    @Transactional
    public void debit(UUID vendorId, BigDecimal amount, UUID referenceOrderId, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be positive");
        }
        
        WalletJpaEntity wallet = getOrCreateWallet(vendorId);
        BigDecimal currentBalance = transactionRepository.calculateBalance(wallet.getId());
        
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }
        
        WalletTransactionJpaEntity tx = WalletTransactionJpaEntity.builder()
                .walletId(wallet.getId())
                .type("DEBIT")
                .amount(amount)
                .referenceOrderId(referenceOrderId)
                .description(description)
                .build();
                
        transactionRepository.save(tx);
        log.info("Debited {} from wallet {}, refOrder={}", amount, wallet.getId(), referenceOrderId);
    }

    @Transactional(readOnly = true)
    public java.util.List<WalletTransactionJpaEntity> getTransactions(UUID vendorId) {
        WalletJpaEntity wallet = getOrCreateWallet(vendorId);
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    @Transactional
    public void withdraw(UUID vendorId, BigDecimal amount) {
        // Withdraw acts as a debit, description "WITHDRAWAL"
        debit(vendorId, amount, null, "WITHDRAWAL");
    }
}
