package com.omni.backend.sales.application.service;

import com.omni.backend.shipping.application.service.GhnShippingClient;
import com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingFeeService {

    private final GhnShippingClient ghnShippingClient;
    private final UserAddressRepository userAddressRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final CartService cartService;

    public long calculateShippingFee(UUID addressId, UUID userId) {
        int toDistrictId = 1442;
        String toWardCode = "20109";
        
        if (addressId != null) {
            var addressOpt = userAddressRepository.findById(addressId);
            if (addressOpt.isPresent()) {
                var address = addressOpt.get();
                if (address.getGhnDistrictId() != null) toDistrictId = address.getGhnDistrictId();
                if (address.getGhnWardCode() != null) toWardCode = address.getGhnWardCode();
            }
        }
        
        UserJpaEntity user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        boolean isFreeship = false;
        if (user != null && user.getLoyaltyTier() != null) {
            var tierOpt = loyaltyTierRepository.findById(user.getLoyaltyTier());
            if (tierOpt.isPresent() && Boolean.TRUE.equals(tierOpt.get().getFreeshipEligible())) {
                isFreeship = true;
            }
        }

        if (isFreeship) return 0;
        
        long totalFee = 0;
        int fromDistrictId = 1442;
        String fromWardCode = "20109";
        
        try {
            if (userId != null) {
                CartDto cart = cartService.getCart(userId);
                if (!cart.getItemsByShop().isEmpty()) {
                    for (Map.Entry<UUID, List<CartItemDto>> entry : cart.getItemsByShop().entrySet()) {
                        UUID shopId = entry.getKey();
                        int currentFromDistrict = 1442;
                        String currentFromWard = "20109";
                        var shopOpt = shopRepository.findById(shopId);
                        if (shopOpt.isPresent()) {
                            var shop = shopOpt.get();
                            if (shop.getWarehouseDistrictId() != null) currentFromDistrict = shop.getWarehouseDistrictId();
                            if (shop.getWarehouseWardCode() != null) currentFromWard = shop.getWarehouseWardCode();
                        }
                        long feePerShop = ghnShippingClient.calculateFee(currentFromDistrict, currentFromWard, toDistrictId, toWardCode, 500, 20, 15, 5);
                        totalFee += feePerShop;
                    }
                } else {
                    totalFee = ghnShippingClient.calculateFee(fromDistrictId, fromWardCode, toDistrictId, toWardCode, 500, 20, 15, 5);
                }
            } else {
                totalFee = ghnShippingClient.calculateFee(fromDistrictId, fromWardCode, toDistrictId, toWardCode, 500, 20, 15, 5);
            }
        } catch (Exception e) {
            log.warn("Could not calculate actual shipping fee from cart, returning default fee", e);
            totalFee = ghnShippingClient.calculateFee(fromDistrictId, fromWardCode, toDistrictId, toWardCode, 500, 20, 15, 5);
        }
        return totalFee;
    }

    public long calculateFeeForShop(UUID shopId, UUID addressId, boolean isFreeshipEligible) {
        if (isFreeshipEligible) return 0;
        
        int toDistrictId = 1442;
        String toWardCode = "20109";
        if (addressId != null) {
            var addressOpt = userAddressRepository.findById(addressId);
            if (addressOpt.isPresent()) {
                var address = addressOpt.get();
                if (address.getGhnDistrictId() != null) toDistrictId = address.getGhnDistrictId();
                if (address.getGhnWardCode() != null) toWardCode = address.getGhnWardCode();
            }
        }

        int fromDistrictId = 1442;
        String fromWardCode = "20109";
        if (shopId != null) {
            var shopOpt = shopRepository.findById(shopId);
            if (shopOpt.isPresent()) {
                var shop = shopOpt.get();
                if (shop.getWarehouseDistrictId() != null) fromDistrictId = shop.getWarehouseDistrictId();
                if (shop.getWarehouseWardCode() != null) fromWardCode = shop.getWarehouseWardCode();
            }
        }

        return ghnShippingClient.calculateFee(fromDistrictId, fromWardCode, toDistrictId, toWardCode, 500, 20, 15, 5);
    }
}
