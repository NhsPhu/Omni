package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.ShopVoucherDto;
import com.omni.backend.sales.application.service.ShopVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/vouchers")
@RequiredArgsConstructor
public class VendorVoucherController {

    private final ShopVoucherService shopVoucherService;

    private UUID getShopId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @GetMapping
    public ResponseEntity<List<ShopVoucherDto>> getShopVouchers(Authentication authentication) {
        return ResponseEntity.ok(shopVoucherService.getVouchersByShop(getShopId(authentication)));
    }

    @PostMapping
    public ResponseEntity<ShopVoucherDto> createVoucher(@RequestBody ShopVoucherDto dto, Authentication authentication) {
        dto.setShopId(getShopId(authentication));
        return ResponseEntity.ok(shopVoucherService.createVoucher(dto));
    }
}

