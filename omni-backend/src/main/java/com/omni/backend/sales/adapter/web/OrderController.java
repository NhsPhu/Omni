package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.application.service.OrderService;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ShopRepository shopRepository;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    private UUID getShopIdForCurrentUser(Authentication authentication) {
        UUID userId = getUserId(authentication);
        ShopJpaEntity shop = shopRepository.findByOwnerId(userId)
                .orElseGet(() -> {
                    ShopJpaEntity newShop = ShopJpaEntity.builder()
                            .ownerId(userId)
                            .name("Demo Shop")
                            .status("ACTIVE")
                            .rating(java.math.BigDecimal.valueOf(5.0))
                            .totalSales(0)
                            .build();
                    return shopRepository.save(newShop);
                });
        
        if (!"ACTIVE".equals(shop.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Shop của bạn chưa được duyệt hoặc đang bị khóa");
        }
        return shop.getId();
    }

    // --- User Endpoints ---

    @GetMapping("/me/orders")
    public ResponseEntity<List<ParentOrderJpaEntity>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.getUserOrders(getUserId(authentication)));
    }

    @PatchMapping("/me/orders/{id}/cancel")
    public ResponseEntity<Void> cancelMyOrder(Authentication authentication, @PathVariable UUID id) {
        orderService.cancelUserOrder(getUserId(authentication), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/orders/{id}/complete")
    public ResponseEntity<Void> completeMyOrder(Authentication authentication, @PathVariable UUID id) {
        orderService.completeUserOrder(getUserId(authentication), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/orders/{childOrderId}/tracking")
    public ResponseEntity<com.omni.backend.sales.application.dto.TrackingResponseDto> getTrackingTimeline(
            Authentication authentication, 
            @PathVariable UUID childOrderId) {
        return ResponseEntity.ok(orderService.getTrackingTimeline(childOrderId, getUserId(authentication)));
    }

    @PostMapping("/me/orders/{childOrderId}/return")
    public ResponseEntity<Void> requestReturn(
            Authentication authentication,
            @PathVariable UUID childOrderId,
            @RequestBody com.omni.backend.sales.application.dto.ReturnOrderRequest request) {
        orderService.requestReturn(getUserId(authentication), childOrderId, request);
        return ResponseEntity.ok().build();
    }

    // --- Vendor Endpoints ---

    @GetMapping("/vendor/orders")
    public ResponseEntity<List<com.omni.backend.sales.application.dto.VendorOrderDto>> getVendorOrders(Authentication authentication) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        return ResponseEntity.ok(orderService.getVendorOrders(shopId));
    }

    @GetMapping("/vendor/statistics")
    public ResponseEntity<com.omni.backend.sales.application.dto.VendorStatisticsDto> getVendorStatistics(Authentication authentication) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        return ResponseEntity.ok(orderService.getVendorStatistics(shopId));
    }

    @PatchMapping("/vendor/orders/{id}/status")
    public ResponseEntity<Void> updateVendorOrderStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam String status) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        orderService.updateVendorOrderStatus(shopId, id, status, getUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/vendor/orders/{id}/ship")
    public ResponseEntity<ChildOrderJpaEntity> shipVendorOrder(Authentication authentication, @PathVariable UUID id) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        return ResponseEntity.ok(orderService.shipVendorOrder(shopId, id, getUserId(authentication)));
    }
}

