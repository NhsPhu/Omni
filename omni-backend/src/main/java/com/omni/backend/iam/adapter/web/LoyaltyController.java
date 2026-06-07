package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.service.LoyaltyService;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/me/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserRepository userRepository;
    private final LoyaltyTierRepository tierRepository;

    @GetMapping
    public ResponseEntity<?> getMyLoyalty(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserJpaEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        var tierInfo = tierRepository.findById(user.getLoyaltyTier()).orElse(null);
        var history = loyaltyService.getTransactionHistory(user.getId());

        return ResponseEntity.ok(Map.of(
                "points", user.getLoyaltyPoints(),
                "tier", user.getLoyaltyTier(),
                "tierInfo", tierInfo,
                "history", history
        ));
    }
}
