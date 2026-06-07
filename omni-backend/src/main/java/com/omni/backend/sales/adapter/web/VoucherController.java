package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.application.dto.PlatformVoucherDto;
import com.omni.backend.sales.application.dto.ShopVoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/public/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final PlatformVoucherRepository platformVoucherRepository;
    private final ShopVoucherRepository shopVoucherRepository;

    @GetMapping("/validate")
    public ResponseEntity<PlatformVoucherDto> validateVoucher(@RequestParam String code) {
        PlatformVoucherJpaEntity voucher = platformVoucherRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found or inactive"));

        if (voucher.getValidTo().isBefore(ZonedDateTime.now()) || voucher.getValidFrom().isAfter(ZonedDateTime.now())) {
            throw new RuntimeException("Voucher is not valid at this time");
        }
        
        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new RuntimeException("Voucher usage limit reached");
        }

        PlatformVoucherDto dto = PlatformVoucherDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .validFrom(voucher.getValidFrom())
                .validTo(voucher.getValidTo())
                .build();

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/platform")
    public ResponseEntity<java.util.List<PlatformVoucherDto>> getValidPlatformVouchers() {
        ZonedDateTime now = ZonedDateTime.now();
        java.util.List<PlatformVoucherDto> vouchers = platformVoucherRepository.findAll().stream()
                .filter(v -> !v.getValidFrom().isAfter(now) && !v.getValidTo().isBefore(now))
                .filter(v -> v.getUsageLimit() == null || v.getUsageLimit() == 0 || v.getUsedCount() == null || v.getUsedCount() < v.getUsageLimit())
                .map(v -> PlatformVoucherDto.builder()
                        .id(v.getId())
                        .code(v.getCode())
                        .discountType(v.getDiscountType())
                        .discountValue(v.getDiscountValue())
                        .maxDiscountAmount(v.getMaxDiscountAmount())
                        .minOrderValue(v.getMinOrderValue())
                        .usageLimit(v.getUsageLimit())
                        .usedCount(v.getUsedCount())
                        .validFrom(v.getValidFrom())
                        .validTo(v.getValidTo())
                        .build())
                .toList();
        return ResponseEntity.ok(vouchers);
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<java.util.List<ShopVoucherDto>> getValidShopVouchers(@PathVariable java.util.UUID shopId) {
        ZonedDateTime now = ZonedDateTime.now();
        java.util.List<ShopVoucherDto> vouchers = shopVoucherRepository.findByShopId(shopId).stream()
                .filter(v -> !v.getValidFrom().isAfter(now) && !v.getValidTo().isBefore(now))
                .filter(v -> v.getUsageLimit() == null || v.getUsageLimit() == 0 || v.getUsedCount() == null || v.getUsedCount() < v.getUsageLimit())
                .map(v -> ShopVoucherDto.builder()
                        .id(v.getId())
                        .shopId(v.getShopId())
                        .code(v.getCode())
                        .discountType(v.getDiscountType())
                        .discountValue(v.getDiscountValue())
                        .maxDiscountAmount(v.getMaxDiscountAmount())
                        .minOrderValue(v.getMinOrderValue())
                        .usageLimit(v.getUsageLimit())
                        .usedCount(v.getUsedCount())
                        .validFrom(v.getValidFrom())
                        .validTo(v.getValidTo())
                        .build())
                .toList();
        return ResponseEntity.ok(vouchers);
    }
}
