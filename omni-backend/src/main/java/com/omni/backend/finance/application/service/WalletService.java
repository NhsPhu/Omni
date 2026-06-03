package com.omni.backend.finance.application.service;

import com.omni.backend.finance.adapter.persistence.entity.AdminWalletJpaEntity;
import com.omni.backend.finance.adapter.persistence.entity.VendorWalletJpaEntity;
import com.omni.backend.finance.adapter.persistence.entity.WalletTransactionJpaEntity;
import com.omni.backend.finance.adapter.persistence.entity.WithdrawalRequestJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.AdminWalletRepository;
import com.omni.backend.finance.adapter.persistence.repository.VendorWalletRepository;
import com.omni.backend.finance.adapter.persistence.repository.WalletTransactionRepository;
import com.omni.backend.finance.adapter.persistence.repository.WithdrawalRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final AdminWalletRepository adminWalletRepository;
    private final VendorWalletRepository vendorWalletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;

    @Transactional
    public void creditAdminPending(UUID orderId, long amount) {
        AdminWalletJpaEntity adminWallet = getOrCreateAdminWalletLocked();

        long balanceBefore = adminWallet.getPendingBalance();
        long balanceAfter = balanceBefore + amount;

        adminWallet.setPendingBalance(balanceAfter);
        adminWalletRepository.save(adminWallet);

        WalletTransactionJpaEntity tx = WalletTransactionJpaEntity.builder()
                .walletType("ADMIN")
                .walletId(adminWallet.getId())
                .orderId(orderId)
                .type("CUSTOMER_PAYMENT")
                .amount(amount)
                .balanceAfter(balanceAfter)
                .note("Khách hàng thanh toán đơn hàng " + orderId)
                .build();
        transactionRepository.save(tx);
        
        log.info("Credited pending admin wallet for order {}. Amount: {}", orderId, amount);
    }

    @Transactional
    public void settleToVendor(UUID shopOrderId, UUID shopId, long vendorAmount, long commissionAmount) {
        AdminWalletJpaEntity adminWallet = getOrCreateAdminWalletLocked();
        VendorWalletJpaEntity vendorWallet = getOrCreateVendorWalletLocked(shopId);

        long totalOrderAmount = vendorAmount + commissionAmount;

        // 1. Debit Admin Pending
        long adminPendingAfter = adminWallet.getPendingBalance() - totalOrderAmount;
        adminWallet.setPendingBalance(adminPendingAfter);
        
        WalletTransactionJpaEntity txAdminDebit = WalletTransactionJpaEntity.builder()
                .walletType("ADMIN")
                .walletId(adminWallet.getId())
                .shopOrderId(shopOrderId)
                .type("SETTLEMENT_DEBIT")
                .amount(totalOrderAmount)
                .balanceAfter(adminPendingAfter)
                .note("Đối soát trừ pending cho shop_order " + shopOrderId)
                .build();
        transactionRepository.save(txAdminDebit);

        // 2. Credit Admin Available (Commission)
        long adminAvailableAfter = adminWallet.getAvailableBalance() + commissionAmount;
        adminWallet.setAvailableBalance(adminAvailableAfter);
        adminWalletRepository.save(adminWallet);
        
        WalletTransactionJpaEntity txAdminCredit = WalletTransactionJpaEntity.builder()
                .walletType("ADMIN")
                .walletId(adminWallet.getId())
                .shopOrderId(shopOrderId)
                .type("COMMISSION_REVENUE")
                .amount(commissionAmount)
                .balanceAfter(adminAvailableAfter)
                .note("Hoa hồng sàn từ shop_order " + shopOrderId)
                .build();
        transactionRepository.save(txAdminCredit);

        // 3. Credit Vendor Available
        long vendorAvailableAfter = vendorWallet.getAvailableBalance() + vendorAmount;
        long vendorTotalEarnedAfter = vendorWallet.getTotalEarned() + vendorAmount;
        
        vendorWallet.setAvailableBalance(vendorAvailableAfter);
        vendorWallet.setTotalEarned(vendorTotalEarnedAfter);
        vendorWalletRepository.save(vendorWallet);

        WalletTransactionJpaEntity txVendorCredit = WalletTransactionJpaEntity.builder()
                .walletType("VENDOR")
                .walletId(vendorWallet.getId())
                .shopOrderId(shopOrderId)
                .type("SETTLEMENT_CREDIT")
                .amount(vendorAmount)
                .balanceAfter(vendorAvailableAfter)
                .note("Giải ngân cho shop_order " + shopOrderId)
                .build();
        transactionRepository.save(txVendorCredit);

        log.info("Settled shop_order {} to vendor {}. Vendor: {}, Commission: {}", shopOrderId, shopId, vendorAmount, commissionAmount);
    }

    @Transactional
    public void processRefund(UUID shopOrderId, UUID shopId, long refundAmount, boolean isSettled, long commissionAmount) {
        AdminWalletJpaEntity adminWallet = getOrCreateAdminWalletLocked();
        
        if (!isSettled) {
            // Debit Admin Pending
            long adminPendingAfter = adminWallet.getPendingBalance() - refundAmount;
            adminWallet.setPendingBalance(adminPendingAfter);
            adminWalletRepository.save(adminWallet);
            
            WalletTransactionJpaEntity txAdminRefund = WalletTransactionJpaEntity.builder()
                    .walletType("ADMIN")
                    .walletId(adminWallet.getId())
                    .shopOrderId(shopOrderId)
                    .type("REFUND_DEBIT")
                    .amount(refundAmount)
                    .balanceAfter(adminPendingAfter)
                    .note("Hoàn tiền đơn hàng chưa đối soát " + shopOrderId)
                    .build();
            transactionRepository.save(txAdminRefund);
        } else {
            VendorWalletJpaEntity vendorWallet = getOrCreateVendorWalletLocked(shopId);
            long vendorRefundAmount = refundAmount - commissionAmount;
            
            // Debit Vendor Available
            long vendorAvailableAfter = vendorWallet.getAvailableBalance() - vendorRefundAmount;
            vendorWallet.setAvailableBalance(vendorAvailableAfter);
            vendorWalletRepository.save(vendorWallet);

            WalletTransactionJpaEntity txVendorRefund = WalletTransactionJpaEntity.builder()
                    .walletType("VENDOR")
                    .walletId(vendorWallet.getId())
                    .shopOrderId(shopOrderId)
                    .type("REFUND_DEBIT")
                    .amount(vendorRefundAmount)
                    .balanceAfter(vendorAvailableAfter)
                    .note("Hoàn tiền đơn hàng đã đối soát " + shopOrderId)
                    .build();
            transactionRepository.save(txVendorRefund);

            // Debit Admin Available (Refund Commission)
            long adminAvailableAfter = adminWallet.getAvailableBalance() - commissionAmount;
            adminWallet.setAvailableBalance(adminAvailableAfter);
            adminWalletRepository.save(adminWallet);

            WalletTransactionJpaEntity txAdminRefund = WalletTransactionJpaEntity.builder()
                    .walletType("ADMIN")
                    .walletId(adminWallet.getId())
                    .shopOrderId(shopOrderId)
                    .type("REFUND_DEBIT")
                    .amount(commissionAmount)
                    .balanceAfter(adminAvailableAfter)
                    .note("Hoàn lại hoa hồng sàn cho đơn " + shopOrderId)
                    .build();
            transactionRepository.save(txAdminRefund);
        }
        
        log.info("Processed refund for shop_order {}. Settled: {}, Total Refund: {}", shopOrderId, isSettled, refundAmount);
    }

    @Transactional
    public WithdrawalRequestJpaEntity requestWithdrawal(UUID shopId, long amount, String bankName, String bankAccountNo, String bankAccountName) {
        VendorWalletJpaEntity vendorWallet = getOrCreateVendorWalletLocked(shopId);
        
        if (amount <= 0 || vendorWallet.getAvailableBalance() < amount) {
            throw new IllegalArgumentException("Số dư không đủ hoặc số tiền không hợp lệ");
        }
        
        WithdrawalRequestJpaEntity req = WithdrawalRequestJpaEntity.builder()
                .shopId(shopId)
                .walletId(vendorWallet.getId())
                .amount(amount)
                .bankName(bankName)
                .bankAccountNumber(bankAccountNo)
                .bankAccountName(bankAccountName)
                .status("PENDING")
                .build();
        return withdrawalRequestRepository.save(req);
    }

    @Transactional
    public void approveWithdrawal(UUID withdrawalId, UUID adminId) {
        WithdrawalRequestJpaEntity req = withdrawalRequestRepository.findById(withdrawalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lệnh rút tiền"));
                
        if (!"PENDING".equals(req.getStatus())) {
            throw new RuntimeException("Lệnh rút tiền đã được xử lý");
        }
        
        VendorWalletJpaEntity vendorWallet = vendorWalletRepository.findByIdLocked(req.getWalletId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví"));
                
        if (vendorWallet.getAvailableBalance() < req.getAmount()) {
            throw new RuntimeException("Số dư ví không đủ để duyệt rút tiền");
        }
        
        // Debit Vendor Available
        long balanceAfter = vendorWallet.getAvailableBalance() - req.getAmount();
        vendorWallet.setAvailableBalance(balanceAfter);
        vendorWalletRepository.save(vendorWallet);
        
        WalletTransactionJpaEntity tx = WalletTransactionJpaEntity.builder()
                .walletType("VENDOR")
                .walletId(vendorWallet.getId())
                .type("WITHDRAWAL_DEBIT")
                .amount(req.getAmount())
                .balanceAfter(balanceAfter)
                .note("Rút tiền về ngân hàng " + req.getBankName())
                .build();
        transactionRepository.save(tx);
        
        req.setStatus("APPROVED");
        req.setApprovedBy(adminId);
        req.setApprovedAt(java.time.ZonedDateTime.now());
        withdrawalRequestRepository.save(req);
    }

    @Transactional(readOnly = true)
    public VendorWalletJpaEntity getVendorWallet(UUID shopId) {
        return getOrCreateVendorWallet(shopId);
    }

    @Transactional(readOnly = true)
    public Page<WalletTransactionJpaEntity> getTransactionHistory(UUID walletId, Pageable pageable) {
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId, pageable);
    }

    private AdminWalletJpaEntity getOrCreateAdminWalletLocked() {
        return adminWalletRepository.findFirstLocked()
                .orElseGet(() -> adminWalletRepository.save(new AdminWalletJpaEntity()));
    }

    private VendorWalletJpaEntity getOrCreateVendorWalletLocked(UUID shopId) {
        return vendorWalletRepository.findByShopIdLocked(shopId)
                .orElseGet(() -> {
                    VendorWalletJpaEntity wallet = VendorWalletJpaEntity.builder()
                            .shopId(shopId)
                            .build();
                    return vendorWalletRepository.save(wallet);
                });
    }

    // Keep the non-locked version for read-only ops
    private VendorWalletJpaEntity getOrCreateVendorWallet(UUID shopId) {
        return vendorWalletRepository.findByShopId(shopId)
                .orElseGet(() -> {
                    VendorWalletJpaEntity wallet = VendorWalletJpaEntity.builder()
                            .shopId(shopId)
                            .build();
                    return vendorWalletRepository.save(wallet);
                });
    }
}
