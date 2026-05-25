package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.application.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
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

    // --- Vendor Endpoints ---

    @GetMapping("/vendor/orders")
    public ResponseEntity<List<ChildOrderJpaEntity>> getVendorOrders(@RequestParam UUID shopId) {
        // In real app, you'd check if the auth user actually owns this shopId
        return ResponseEntity.ok(orderService.getVendorOrders(shopId));
    }

    @PatchMapping("/vendor/orders/{id}/status")
    public ResponseEntity<Void> updateVendorOrderStatus(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam UUID shopId,
            @RequestParam String status) {
        orderService.updateVendorOrderStatus(shopId, id, status, getUserId(authentication));
        return ResponseEntity.ok().build();
    }
}
