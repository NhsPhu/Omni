package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.application.dto.ShopResponseDto;
import com.omni.backend.iam.application.service.ShopService;
import com.omni.backend.shared.security.JwtAuthenticationToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/shops")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminShopController {

    private final ShopService shopService;

    @GetMapping
    public ResponseEntity<List<ShopResponseDto>> getShopsByStatus(@RequestParam(defaultValue = "PENDING_REVIEW") String status) {
        List<ShopResponseDto> shops = shopService.getShopsByStatus(status);
        return ResponseEntity.ok(shops);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ShopResponseDto> approveShop(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam boolean approve,
            @RequestParam(required = false) String reason) {
        
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        UUID adminId = UUID.fromString(jwtAuth.getUserId());
        
        ShopResponseDto response = shopService.approveShop(id, adminId, approve, reason);
        return ResponseEntity.ok(response);
    }
}
