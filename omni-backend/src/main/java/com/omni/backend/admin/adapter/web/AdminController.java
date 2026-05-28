package com.omni.backend.admin.adapter.web;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.domain.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    private UUID getAdminId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserJpaEntity>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userRepository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/shops")
    public ResponseEntity<Page<ShopJpaEntity>> getAllShops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(shopRepository.findAll(PageRequest.of(page, size)));
    }

    @GetMapping("/shops/pending")
    public ResponseEntity<Page<ShopJpaEntity>> getPendingShops(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(shopRepository.findByStatus("PENDING_REVIEW", PageRequest.of(page, size)));
    }

    @PatchMapping("/shops/{id}/approve")
    public ResponseEntity<Void> approveShop(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam boolean approve) {
        ShopJpaEntity shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shop not found"));

        if (approve) {
            shop.setStatus("ACTIVE");
            shop.setApprovedAt(ZonedDateTime.now());
            shop.setApprovedBy(getAdminId(authentication));
            
            // Upgrade user role to PARTNER
            UserJpaEntity owner = userRepository.findById(shop.getOwnerId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            owner.setRole(com.omni.backend.iam.domain.Role.PARTNER);
            userRepository.save(owner);
        } else {
            shop.setStatus("REJECTED"); // Or whatever the rejection status is
        }

        shopRepository.save(shop);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<Void> banUser(@PathVariable UUID id, @RequestParam boolean ban) {
        UserJpaEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (ban) {
            user.setStatus(UserStatus.BANNED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}

