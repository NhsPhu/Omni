package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.AddToCartRequest;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // Helper to get userId from JWT authentication
    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Void> addToCart(Authentication authentication, @RequestBody AddToCartRequest request, @RequestParam(defaultValue = "false") boolean overwrite) {
        UUID userId = getUserId(authentication);
        cartService.addToCart(userId, request.getSkuId(), request.getQuantity(), overwrite);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/items/{skuId}")
    public ResponseEntity<Void> updateCartItem(Authentication authentication, @PathVariable UUID skuId, @RequestParam int quantity) {
        UUID userId = getUserId(authentication);
        cartService.updateCartItemQuantity(userId, skuId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/items/{skuId}")
    public ResponseEntity<Void> removeFromCart(Authentication authentication, @PathVariable UUID skuId) {
        UUID userId = getUserId(authentication);
        cartService.removeFromCart(userId, skuId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        UUID userId = getUserId(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.ok().build();
    }
}

