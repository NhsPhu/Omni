package com.omni.backend.sales.adapter.web;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.sales.application.dto.ShopVoucherDto;
import com.omni.backend.sales.application.service.ShopVoucherService;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/vouchers")
@RequiredArgsConstructor
public class VendorVoucherController {

    private final ShopVoucherService shopVoucherService;
    private final ShopRepository shopRepository;

    private UUID getShopIdForCurrentUser(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID userId = userDetails.getId();
        ShopJpaEntity shop = shopRepository.findByOwnerId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký Shop hoặc Shop chưa được duyệt"));
        
        if (!"ACTIVE".equals(shop.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Shop của bạn chưa được duyệt hoặc đang bị khóa");
        }
        return shop.getId();
    }

    @GetMapping
    public ResponseEntity<List<ShopVoucherDto>> getShopVouchers(Authentication authentication) {
        return ResponseEntity.ok(shopVoucherService.getVouchersByShop(getShopIdForCurrentUser(authentication)));
    }

    @PostMapping
    public ResponseEntity<ShopVoucherDto> createVoucher(@RequestBody ShopVoucherDto dto, Authentication authentication) {
        dto.setShopId(getShopIdForCurrentUser(authentication));
        return ResponseEntity.ok(shopVoucherService.createVoucher(dto));
    }
}

