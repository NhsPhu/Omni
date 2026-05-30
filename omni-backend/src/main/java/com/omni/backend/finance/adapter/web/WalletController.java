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
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/vendor/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBalance(Authentication authentication) {
        UUID vendorId = getUserId(authentication);
        VendorWalletJpaEntity wallet = walletService.getVendorWallet(vendorId);
        
        return ResponseEntity.ok(Map.of(
            "vendorId", vendorId,
            "availableBalance", wallet.getAvailableBalance(),
            "pendingBalance", wallet.getPendingBalance(),
            "totalEarned", wallet.getTotalEarned(),
            "currency", "VND",
            "transactions", walletService.getTransactionHistory(wallet.getId(), PageRequest.of(0, 50))
        ));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(Authentication authentication, @RequestBody Map<String, Object> payload) {
        UUID vendorId = getUserId(authentication);
        long amount = Long.parseLong(payload.get("amount").toString());
        String bankName = (String) payload.get("bankName");
        String bankAccountNo = (String) payload.get("bankAccountNumber");
        String bankAccountName = (String) payload.get("bankAccountName");
        
        walletService.requestWithdrawal(vendorId, amount, bankName, bankAccountNo, bankAccountName);
        return ResponseEntity.ok().build();
    }
}

