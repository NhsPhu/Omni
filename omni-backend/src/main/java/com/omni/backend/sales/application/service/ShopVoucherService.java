package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.application.dto.ShopVoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopVoucherService {

    private final ShopVoucherRepository shopVoucherRepository;

    @Transactional(readOnly = true)
    public List<ShopVoucherDto> getVouchersByShop(UUID shopId) {
        return shopVoucherRepository.findByShopId(shopId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShopVoucherDto createVoucher(ShopVoucherDto dto) {
        ShopVoucherJpaEntity entity = ShopVoucherJpaEntity.builder()
                .shopId(dto.getShopId())
                .code(dto.getCode().toUpperCase())
                .discountType(dto.getDiscountType())
                .discountValue(dto.getDiscountValue())
                .minOrderValue(dto.getMinOrderValue())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .usageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 0)
                .usedCount(0)
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .build();
        
        entity = shopVoucherRepository.save(entity);
        return mapToDto(entity);
    }

    private ShopVoucherDto mapToDto(ShopVoucherJpaEntity entity) {
        return ShopVoucherDto.builder()
                .id(entity.getId())
                .shopId(entity.getShopId())
                .code(entity.getCode())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .minOrderValue(entity.getMinOrderValue())
                .maxDiscountAmount(entity.getMaxDiscountAmount())
                .usageLimit(entity.getUsageLimit())
                .usedCount(entity.getUsedCount())
                .validFrom(entity.getValidFrom())
                .validTo(entity.getValidTo())
                .build();
    }
}
