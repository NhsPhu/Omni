package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/flash-sale")
@RequiredArgsConstructor
public class UserFlashSaleController {

    private final FlashSaleService flashSaleService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/usage")
    public ResponseEntity<Map<UUID, Integer>> getFlashSaleUsage(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(flashSaleService.getFlashSaleUsage(userId));
    }
}
