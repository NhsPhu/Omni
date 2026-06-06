package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.FunnelDataDto;
import com.omni.backend.sales.application.dto.SkuPerformanceDto;
import com.omni.backend.sales.application.service.OrderService;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/metrics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final OrderService orderService;
    private final ShopRepository shopRepository;

    private UUID getShopIdForCurrentUser(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        ShopJpaEntity shop = shopRepository.findByOwnerId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Shop not found for user"));
        return shop.getId();
    }

    @GetMapping("/funnel")
    public ResponseEntity<FunnelDataDto> getFunnelData(Authentication authentication) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        return ResponseEntity.ok(orderService.getFunnelData(shopId));
    }

    @GetMapping("/sku")
    public ResponseEntity<List<SkuPerformanceDto>> getSkuPerformance(Authentication authentication) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        return ResponseEntity.ok(orderService.getSkuPerformance(shopId));
    }
}
