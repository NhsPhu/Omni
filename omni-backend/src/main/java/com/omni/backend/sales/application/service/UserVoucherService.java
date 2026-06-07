package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.UserVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.UserVoucherRepository;
import com.omni.backend.sales.application.dto.UserVoucherDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserVoucherService {

    private final UserVoucherRepository userVoucherRepository;
    private final PlatformVoucherRepository platformVoucherRepository;
    private final ShopVoucherRepository shopVoucherRepository;

    public UserVoucherDto saveVoucher(UUID userId, UUID voucherId, String voucherType) {
        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)) {
            throw new RuntimeException("Voucher đã được lưu");
        }

        if ("PLATFORM".equalsIgnoreCase(voucherType)) {
            PlatformVoucherJpaEntity voucher = platformVoucherRepository.findById(voucherId)
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new RuntimeException("Voucher đã hết lượt sử dụng");
            }
        } else if ("SHOP".equalsIgnoreCase(voucherType)) {
            ShopVoucherJpaEntity voucher = shopVoucherRepository.findById(voucherId)
                    .orElseThrow(() -> new RuntimeException("Voucher không tồn tại"));
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new RuntimeException("Voucher đã hết lượt sử dụng");
            }
        } else {
            throw new IllegalArgumentException("Loại voucher không hợp lệ");
        }

        UserVoucherJpaEntity userVoucher = UserVoucherJpaEntity.builder()
                .userId(userId)
                .voucherId(voucherId)
                .voucherType(voucherType.toUpperCase())
                .isUsed(false)
                .build();

        userVoucherRepository.save(userVoucher);
        return mapToDto(userVoucher);
    }

    public List<UserVoucherDto> getMyVouchers(UUID userId) {
        List<UserVoucherJpaEntity> userVouchers = userVoucherRepository.findByUserId(userId);
        ZonedDateTime now = ZonedDateTime.now();
        List<UserVoucherDto> result = new ArrayList<>();

        for (UserVoucherJpaEntity uv : userVouchers) {
            if ("PLATFORM".equals(uv.getVoucherType())) {
                platformVoucherRepository.findById(uv.getVoucherId()).ifPresent(v -> {
                    if (!v.getValidTo().isBefore(now)) {
                        result.add(UserVoucherDto.builder()
                                .id(uv.getId())
                                .voucherId(v.getId())
                                .voucherType("PLATFORM")
                                .shopId(null)
                                .code(v.getCode())
                                .discountType(v.getDiscountType())
                                .discountValue(v.getDiscountValue())
                                .minOrderValue(v.getMinOrderValue())
                                .maxDiscountAmount(v.getMaxDiscountAmount())
                                .validFrom(v.getValidFrom())
                                .validTo(v.getValidTo())
                                .isUsed(uv.getIsUsed())
                                .build());
                    }
                });
            } else if ("SHOP".equals(uv.getVoucherType())) {
                shopVoucherRepository.findById(uv.getVoucherId()).ifPresent(v -> {
                    if (!v.getValidTo().isBefore(now)) {
                        result.add(UserVoucherDto.builder()
                                .id(uv.getId())
                                .voucherId(v.getId())
                                .voucherType("SHOP")
                                .shopId(v.getShopId())
                                .code(v.getCode())
                                .discountType(v.getDiscountType())
                                .discountValue(v.getDiscountValue())
                                .minOrderValue(v.getMinOrderValue())
                                .maxDiscountAmount(v.getMaxDiscountAmount())
                                .validFrom(v.getValidFrom())
                                .validTo(v.getValidTo())
                                .isUsed(uv.getIsUsed())
                                .build());
                    }
                });
            }
        }
        return result;
    }

    private UserVoucherDto mapToDto(UserVoucherJpaEntity uv) {
        return UserVoucherDto.builder()
                .id(uv.getId())
                .voucherId(uv.getVoucherId())
                .voucherType(uv.getVoucherType())
                .isUsed(uv.getIsUsed())
                .build();
    }
}
