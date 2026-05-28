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
        BigDecimal balance = walletService.getBalance(vendorId);
        
        return ResponseEntity.ok(Map.of(
            "vendorId", vendorId,
            "balance", balance,
            "currency", "VND",
            "transactions", walletService.getTransactions(vendorId)
        ));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Void> withdraw(Authentication authentication, @RequestBody Map<String, Object> payload) {
        UUID vendorId = getUserId(authentication);
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        walletService.withdraw(vendorId, amount);
        return ResponseEntity.ok().build();
    }
}

