package com.omni.backend.catalog.adapter.web;

import com.omni.backend.catalog.application.dto.ProductDto;
import com.omni.backend.catalog.application.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.omni.backend.shared.security.CustomUserDetails;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    private UUID getUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return null;
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getId();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto>> getMyWishlist(Authentication authentication) {
        UUID userId = getUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> toggleWishlist(Authentication authentication, @PathVariable UUID productId) {
        UUID userId = getUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).build();
        wishlistService.toggleWishlist(userId, productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<Boolean> checkWishlist(Authentication authentication, @PathVariable UUID productId) {
        UUID userId = getUserId(authentication);
        if (userId == null) return ResponseEntity.ok(false);
        return ResponseEntity.ok(wishlistService.checkWishlist(userId, productId));
    }
}
