package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.application.dto.ShopRegistrationDto;
import com.omni.backend.iam.application.dto.ShopResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.ZonedDateTime;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;

    @Transactional
    public ShopResponseDto registerShop(UUID ownerId, ShopRegistrationDto dto) {
        if (shopRepository.findByOwnerId(ownerId).isPresent()) {
            throw new IllegalArgumentException("User already has a registered shop.");
        }

        ShopJpaEntity shop = ShopJpaEntity.builder()
                .ownerId(ownerId)
                .name(dto.getName())
                .description(dto.getDescription())
                .address(dto.getAddress())
                .pickupAddress(dto.getPickupAddress())
                .bankName(dto.getBankName())
                .bankAccountNumber(dto.getBankAccountNumber())
                .bankAccountName(dto.getBankAccountName())
                .status("PENDING_REVIEW")
                .rating(BigDecimal.ZERO)
                .totalSales(0)
                .build();

        ShopJpaEntity saved = shopRepository.save(shop);
        return mapToDto(saved);
    }

    public List<ShopResponseDto> getShopsByStatus(String status) {
        return shopRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShopResponseDto approveShop(UUID shopId, UUID adminId, boolean approve, String rejectReason) {
        ShopJpaEntity shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found"));

        if (!"PENDING_REVIEW".equals(shop.getStatus())) {
            throw new IllegalStateException("Shop is not in PENDING_REVIEW state");
        }

        if (approve) {
            shop.setStatus("ACTIVE");
            shop.setApprovedAt(ZonedDateTime.now());
            shop.setApprovedBy(adminId);
            // TODO: In a real system, we should also update User role to ROLE_PARTNER here
        } else {
            shop.setStatus("REJECTED");
            // Optionally save the rejectReason in a note field or send an email
        }

        ShopJpaEntity saved = shopRepository.save(shop);
        return mapToDto(saved);
    }

    public ShopResponseDto getShopByOwner(UUID ownerId) {
        return shopRepository.findByOwnerId(ownerId)
                .map(this::mapToDto)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found for this user"));
    }

    private ShopResponseDto mapToDto(ShopJpaEntity entity) {
        return ShopResponseDto.builder()
                .id(entity.getId())
                .ownerId(entity.getOwnerId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .address(entity.getAddress())
                .pickupAddress(entity.getPickupAddress())
                .rating(entity.getRating())
                .totalSales(entity.getTotalSales())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
