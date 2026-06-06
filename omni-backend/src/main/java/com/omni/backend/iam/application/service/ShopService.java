package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.application.dto.ShopRegistrationDto;
import com.omni.backend.iam.application.dto.ShopResponseDto;
import com.omni.backend.iam.application.dto.ShopUpdateDto;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.ZonedDateTime;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

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
                .warehouseProvinceId(dto.getWarehouseProvinceId())
                .warehouseDistrictId(dto.getWarehouseDistrictId())
                .warehouseWardCode(dto.getWarehouseWardCode())
                .build();

        ShopJpaEntity saved = shopRepository.save(shop);
        ShopResponseDto response = mapToDto(saved);
        response.setMessage("Shop đã được đăng ký thành công và đang chờ ban quản trị duyệt.");
        return response;
    }

    public List<ShopResponseDto> getShopsByStatus(String status) {
        return shopRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Page<ShopResponseDto> getAllShops(int page, int size) {
        return shopRepository.findAll(PageRequest.of(page, size))
                .map(this::mapToDto);
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
            
            // Đổi role của User -> ROLE_VENDOR
            UserJpaEntity user = userRepository.findById(shop.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            user.setRole(Role.ROLE_VENDOR);
            userRepository.save(user);
        } else {
            shop.setStatus("REJECTED");
            // Optionally save the rejectReason in a note field or send an email
        }

        ShopJpaEntity saved = shopRepository.save(shop);
        return mapToDto(saved);
    }

    @Transactional
    public ShopResponseDto getShopByOwner(UUID ownerId) {
        return shopRepository.findByOwnerId(ownerId)
                .map(this::mapToDto)
                .orElseGet(() -> {
                    ShopJpaEntity newShop = ShopJpaEntity.builder()
                            .ownerId(ownerId)
                            .name("Demo Shop")
                            .description("Cửa hàng tự động tạo cho mục đích dev")
                            .status("ACTIVE")
                            .rating(BigDecimal.valueOf(5.0))
                            .totalSales(0)
                            .build();
                    return mapToDto(shopRepository.save(newShop));
                });
    }

    public ShopResponseDto getShopById(UUID shopId) {
        return shopRepository.findById(shopId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found"));
    }

    @Transactional
    public ShopResponseDto updateShop(UUID ownerId, ShopUpdateDto dto) {
        ShopJpaEntity shop = shopRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop not found for this user"));

        shop.setName(dto.getName());
        shop.setDescription(dto.getDescription());
        shop.setAddress(dto.getAddress());
        shop.setPickupAddress(dto.getPickupAddress());
        
        if (dto.getBankName() != null) shop.setBankName(dto.getBankName());
        if (dto.getBankAccountNumber() != null) shop.setBankAccountNumber(dto.getBankAccountNumber());
        if (dto.getBankAccountName() != null) shop.setBankAccountName(dto.getBankAccountName());
        if (dto.getWarehouseProvinceId() != null) shop.setWarehouseProvinceId(dto.getWarehouseProvinceId());
        if (dto.getWarehouseDistrictId() != null) shop.setWarehouseDistrictId(dto.getWarehouseDistrictId());
        if (dto.getWarehouseWardCode() != null) shop.setWarehouseWardCode(dto.getWarehouseWardCode());
        if (dto.getGhnShopId() != null) shop.setGhnShopId(dto.getGhnShopId());
        if (dto.getLogoUrl() != null) shop.setLogoUrl(dto.getLogoUrl());
        if (dto.getBannerUrl() != null) shop.setBannerUrl(dto.getBannerUrl());

        ShopJpaEntity updated = shopRepository.save(shop);
        return mapToDto(updated);
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
                .warehouseProvinceId(entity.getWarehouseProvinceId())
                .warehouseDistrictId(entity.getWarehouseDistrictId())
                .warehouseWardCode(entity.getWarehouseWardCode())
                .ghnShopId(entity.getGhnShopId())
                .bankName(entity.getBankName())
                .bankAccountNumber(entity.getBankAccountNumber())
                .bankAccountName(entity.getBankAccountName())
                .logoUrl(entity.getLogoUrl())
                .bannerUrl(entity.getBannerUrl())
                .build();
    }
}
