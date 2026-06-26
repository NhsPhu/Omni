package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.UserVoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VoucherApplicationService {

    private final ShopVoucherRepository shopVoucherRepository;
    private final PlatformVoucherRepository platformVoucherRepository;
    private final UserVoucherRepository userVoucherRepository;

    public BigDecimal applyShopVoucher(List<UUID> voucherIds, UUID shopId, BigDecimal shopSubtotal, UUID userId) {
        if (voucherIds == null || voucherIds.isEmpty()) return BigDecimal.ZERO;
        
        ShopVoucherJpaEntity v = null;
        for (UUID vid : voucherIds) {
            var vOpt = shopVoucherRepository.findById(vid);
            if (vOpt.isPresent() && vOpt.get().getShopId().equals(shopId)) {
                v = vOpt.get();
                break;
            }
        }
        
        if (v == null) return BigDecimal.ZERO;
        
        if (v.getValidTo().isBefore(java.time.ZonedDateTime.now()) || v.getValidFrom().isAfter(java.time.ZonedDateTime.now())) {
            return BigDecimal.ZERO;
        }
        
        if (shopSubtotal.compareTo(v.getMinOrderValue()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(v.getDiscountType())) {
            discount = shopSubtotal.multiply(v.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (v.getMaxDiscountAmount() != null && discount.compareTo(v.getMaxDiscountAmount()) > 0) {
                discount = v.getMaxDiscountAmount();
            }
        } else {
            discount = v.getDiscountValue();
        }

        // Mark as used
        userVoucherRepository.findByUserIdAndVoucherId(userId, v.getId()).ifPresent(uv -> {
            uv.setIsUsed(true);
            userVoucherRepository.save(uv);
        });
        if (v.getUsedCount() != null) {
            v.setUsedCount(v.getUsedCount() + 1);
            shopVoucherRepository.save(v);
        }

        return discount;
    }

    public BigDecimal applyShippingVoucher(UUID voucherId, BigDecimal totalShippingFee, BigDecimal grandTotal, UUID userId) {
        if (voucherId == null) return BigDecimal.ZERO;

        PlatformVoucherJpaEntity v = platformVoucherRepository.findById(voucherId).orElse(null);
        if (v == null || !"SHIPPING".equals(v.getCategory()) || v.getValidTo().isBefore(java.time.ZonedDateTime.now()) || v.getValidFrom().isAfter(java.time.ZonedDateTime.now())) {
            return BigDecimal.ZERO;
        }

        if (grandTotal.compareTo(v.getMinOrderValue()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(v.getDiscountType())) {
            discount = totalShippingFee.multiply(v.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (v.getMaxDiscountAmount() != null && discount.compareTo(v.getMaxDiscountAmount()) > 0) {
                discount = v.getMaxDiscountAmount();
            }
        } else {
            discount = v.getDiscountValue();
        }

        if (discount.compareTo(totalShippingFee) > 0) {
            discount = totalShippingFee;
        }

        // Mark as used
        userVoucherRepository.findByUserIdAndVoucherId(userId, v.getId()).ifPresent(uv -> {
            uv.setIsUsed(true);
            userVoucherRepository.save(uv);
        });
        if (v.getUsedCount() != null) {
            v.setUsedCount(v.getUsedCount() + 1);
            platformVoucherRepository.save(v);
        }

        return discount;
    }

    public BigDecimal applyPlatformVoucher(UUID voucherId, BigDecimal grandTotal, UUID userId) {
        if (voucherId == null) return BigDecimal.ZERO;

        PlatformVoucherJpaEntity v = platformVoucherRepository.findById(voucherId).orElse(null);
        if (v == null || v.getValidTo().isBefore(java.time.ZonedDateTime.now()) || v.getValidFrom().isAfter(java.time.ZonedDateTime.now())) {
            return BigDecimal.ZERO;
        }

        if (grandTotal.compareTo(v.getMinOrderValue()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if ("PERCENTAGE".equalsIgnoreCase(v.getDiscountType())) {
            discount = grandTotal.multiply(v.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (v.getMaxDiscountAmount() != null && discount.compareTo(v.getMaxDiscountAmount()) > 0) {
                discount = v.getMaxDiscountAmount();
            }
        } else {
            discount = v.getDiscountValue();
        }

        // Mark as used
        userVoucherRepository.findByUserIdAndVoucherId(userId, v.getId()).ifPresent(uv -> {
            uv.setIsUsed(true);
            userVoucherRepository.save(uv);
        });
        if (v.getUsedCount() != null) {
            v.setUsedCount(v.getUsedCount() + 1);
            platformVoucherRepository.save(v);
        }

        return discount;
    }
}
