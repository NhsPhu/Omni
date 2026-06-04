package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.FlashSaleEventDto;
import com.omni.backend.sales.application.dto.FlashSaleItemDto;
import com.omni.backend.sales.application.service.FlashSaleService;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/flash-sale")
@RequiredArgsConstructor
public class VendorFlashSaleController {

    private final FlashSaleService flashSaleService;

    @PostMapping("/{eventId}/register")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<FlashSaleItemDto> registerProduct(
            @PathVariable UUID eventId,
            @RequestBody FlashSaleItemDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(flashSaleService.registerProduct(eventId, dto, userDetails.getShopId()));
    }

    @GetMapping("/{eventId}/my-items")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<FlashSaleItemDto>> getMyRegistrations(
            @PathVariable UUID eventId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(flashSaleService.getVendorRegistrations(eventId, userDetails.getShopId()));
    }

    @GetMapping("/events")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<FlashSaleEventDto>> getAvailableEvents() {
        return ResponseEntity.ok(flashSaleService.getAllEvents());
    }
}
