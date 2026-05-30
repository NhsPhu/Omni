package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.adapter.persistence.entity.VoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.VoucherRepository;
import com.omni.backend.sales.application.dto.VoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/public/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherRepository voucherRepository;

    @GetMapping("/validate")
    public ResponseEntity<VoucherDto> validateVoucher(@RequestParam String code) {
        VoucherJpaEntity voucher = voucherRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Voucher not found or inactive"));

        if (voucher.getExpiryDate().isBefore(ZonedDateTime.now())) {
            throw new RuntimeException("Voucher has expired");
        }

        VoucherDto dto = VoucherDto.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountPercent(voucher.getDiscountPercent())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .shopId(voucher.getShopId())
                .expiryDate(voucher.getExpiryDate())
                .active(voucher.getActive())
                .build();

        return ResponseEntity.ok(dto);
    }
}
