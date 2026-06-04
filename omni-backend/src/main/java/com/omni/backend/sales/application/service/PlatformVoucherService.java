package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.application.dto.PlatformVoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class PlatformVoucherService {

    private final PlatformVoucherRepository repository;

    public List<PlatformVoucherDto> getAllVouchers() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PlatformVoucherDto createVoucher(PlatformVoucherDto dto) {
        PlatformVoucherJpaEntity entity = PlatformVoucherJpaEntity.builder()
                .code(dto.getCode())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minOrderValue(dto.getMinOrderValue())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .usageLimit(dto.getUsageLimit())
                .usedCount(0)
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .build();
        PlatformVoucherJpaEntity saved = repository.save(entity);
        return mapToDto(saved);
    }

    private PlatformVoucherDto mapToDto(PlatformVoucherJpaEntity entity) {
        return PlatformVoucherDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .minOrderValue(entity.getMinOrderValue())
                .maxDiscountAmount(entity.getMaxDiscountAmount())
                .usageLimit(entity.getUsageLimit())
                .usedCount(entity.getUsedCount())
                .validFrom(entity.getValidFrom())
                .validTo(entity.getValidTo())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public void stopVoucher(UUID id) {
        PlatformVoucherJpaEntity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        entity.setValidTo(ZonedDateTime.now().minusSeconds(1));
        repository.save(entity);
    }
}
