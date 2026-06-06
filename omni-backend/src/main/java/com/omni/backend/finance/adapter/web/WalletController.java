package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.application.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import com.omni.backend.finance.adapter.persistence.entity.VendorWalletJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.CommissionSnapshotRepository;
import com.omni.backend.finance.application.service.SettlementService;
import org.springframework.data.domain.PageRequest;
import java.util.List;

@RestController
@RequestMapping("/api/vendor/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final ShopRepository shopRepository;
    private final ChildOrderRepository childOrderRepository;
    private final CommissionSnapshotRepository commissionSnapshotRepository;
    private final SettlementService settlementService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBalance(Authentication authentication) {
        UUID vendorId = getUserId(authentication);
        ShopJpaEntity shop = shopRepository.findByOwnerId(vendorId)
            .orElseThrow(() -> new RuntimeException("Shop not found"));
            
        // Auto-fix: Settle any COMPLETED orders that were missed
        List<ChildOrderJpaEntity> completedOrders = childOrderRepository.findByShopId(shop.getId()).stream()
            .filter(o -> "COMPLETED".equals(o.getStatus()))
            .toList();
        for (ChildOrderJpaEntity o : completedOrders) {
            if (!commissionSnapshotRepository.existsByShopOrderId(o.getId())) {
                o.setStatus("DELIVERED");
                childOrderRepository.save(o);
                settlementService.settle(o.getId());
            }
        }
        
        VendorWalletJpaEntity wallet = walletService.getVendorWallet(shop.getId());
        
        // Calculate pending balance dynamically
        long calculatedPending = childOrderRepository.findByShopId(shop.getId()).stream()
            .filter(o -> List.of("PENDING", "PROCESSING", "SHIPPED", "DELIVERED").contains(o.getStatus()))
            .mapToLong(o -> o.getTotalAmount().longValue())
            .sum();
        
        return ResponseEntity.ok(Map.of(
            "vendorId", vendorId,
            "shopId", shop.getId(),
            "availableBalance", wallet.getAvailableBalance(),
            "pendingBalance", calculatedPending,
            "totalEarned", wallet.getTotalEarned(),
            "currency", "VND",
            "transactions", walletService.getTransactionHistory(wallet.getId(), PageRequest.of(0, 50))
        ));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(Authentication authentication, @RequestBody Map<String, Object> payload) {
        UUID vendorId = getUserId(authentication);
        ShopJpaEntity shop = shopRepository.findByOwnerId(vendorId)
            .orElseThrow(() -> new RuntimeException("Shop not found"));
            
        long amount = Long.parseLong(payload.get("amount").toString());
        String bankName = (String) payload.get("bankName");
        String bankAccountNo = (String) payload.get("bankAccountNumber");
        String bankAccountName = (String) payload.get("bankAccountName");
        
        walletService.requestWithdrawal(shop.getId(), amount, bankName, bankAccountNo, bankAccountName);
        return ResponseEntity.ok().build();
    }
}

