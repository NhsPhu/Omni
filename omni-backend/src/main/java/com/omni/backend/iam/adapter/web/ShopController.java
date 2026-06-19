package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.application.dto.ShopRegistrationDto;
import com.omni.backend.iam.application.dto.ShopResponseDto;
import com.omni.backend.iam.application.dto.ShopUpdateDto;
import com.omni.backend.iam.application.dto.ShopAiSettingsUpdateDto;
import com.omni.backend.iam.application.service.ShopService;
import com.omni.backend.shared.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.UUID;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @PostMapping("/register")
    public ResponseEntity<ShopResponseDto> registerShop(
            Authentication authentication,
            @Valid @RequestBody ShopRegistrationDto dto) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID ownerId = userDetails.getId();
        
        ShopResponseDto response = shopService.registerShop(ownerId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ShopResponseDto> getMyShop(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID ownerId = userDetails.getId();
        
        ShopResponseDto response = shopService.getShopByOwner(ownerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ShopResponseDto> updateMyShop(
            Authentication authentication,
            @Valid @RequestBody ShopUpdateDto dto) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID ownerId = userDetails.getId();
        
        ShopResponseDto response = shopService.updateShop(ownerId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/ai-settings")
    public ResponseEntity<ShopResponseDto> getAiSettings(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID ownerId = userDetails.getId();
        
        ShopResponseDto response = shopService.getShopByOwner(ownerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/ai-settings")
    public ResponseEntity<ShopResponseDto> updateAiSettings(
            Authentication authentication,
            @Valid @RequestBody ShopAiSettingsUpdateDto dto) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID ownerId = userDetails.getId();
        
        ShopResponseDto response = shopService.updateShopAiSettings(ownerId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShopResponseDto> getShopById(@PathVariable UUID id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }
}
