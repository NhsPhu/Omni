package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.application.dto.PlatformVoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/public/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final PlatformVoucherRepository platformVoucherRepository;

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
}
