package com.omni.backend.sales.application.service;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserAddressJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import com.omni.backend.shipping.application.service.GhnShippingClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShippingFeeServiceTest {

    @Mock
    private GhnShippingClient ghnShippingClient;

    @Mock
    private UserAddressRepository userAddressRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoyaltyTierRepository loyaltyTierRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private ShippingFeeService shippingFeeService;

    private final UUID testUserId = UUID.randomUUID();
    private final UUID testAddressId = UUID.randomUUID();
    private final UUID testShopId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
    }

    @Test
    void testCalculateShippingFee_FreeshipEligible() {
        UserJpaEntity user = new UserJpaEntity();
        user.setId(testUserId);
        user.setLoyaltyTier("GOLD");

        LoyaltyTierJpaEntity tier = new LoyaltyTierJpaEntity();
        tier.setFreeshipEligible(true);

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(user));
        when(loyaltyTierRepository.findById(user.getLoyaltyTier())).thenReturn(Optional.of(tier));

        long fee = shippingFeeService.calculateShippingFee(testAddressId, testUserId);

        assertEquals(0, fee);
        verify(ghnShippingClient, never()).calculateFee(anyInt(), anyString(), anyInt(), anyString(), anyInt(), anyInt(), anyInt(), anyInt());
    }

    @Test
    void testCalculateShippingFee_NormalUser_WithCart() {
        UserAddressJpaEntity address = new UserAddressJpaEntity();
        address.setGhnDistrictId(100);
        address.setGhnWardCode("100-W");

        ShopJpaEntity shop = new ShopJpaEntity();
        shop.setWarehouseDistrictId(200);
        shop.setWarehouseWardCode("200-W");

        CartDto cart = new CartDto();
        Map<UUID, List<CartItemDto>> itemsByShop = new HashMap<>();
        itemsByShop.put(testShopId, List.of(new CartItemDto()));
        cart.setItemsByShop(itemsByShop);

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(new UserJpaEntity()));
        when(userAddressRepository.findById(testAddressId)).thenReturn(Optional.of(address));
        when(cartService.getCart(testUserId)).thenReturn(cart);
        when(shopRepository.findById(testShopId)).thenReturn(Optional.of(shop));
        when(ghnShippingClient.calculateFee(eq(200), eq("200-W"), eq(100), eq("100-W"), anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(35000L);

        long fee = shippingFeeService.calculateShippingFee(testAddressId, testUserId);

        assertEquals(35000L, fee);
    }

    @Test
    void testCalculateShippingFee_ExceptionFallback() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(new UserJpaEntity()));
        when(cartService.getCart(testUserId)).thenThrow(new RuntimeException("Redis error"));
        when(ghnShippingClient.calculateFee(anyInt(), anyString(), anyInt(), anyString(), anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(50000L);

        long fee = shippingFeeService.calculateShippingFee(testAddressId, testUserId);

        assertEquals(50000L, fee);
    }

    @Test
    void testCalculateFeeForShop_Success() {
        UserAddressJpaEntity address = new UserAddressJpaEntity();
        address.setGhnDistrictId(100);
        address.setGhnWardCode("100-W");

        ShopJpaEntity shop = new ShopJpaEntity();
        shop.setWarehouseDistrictId(200);
        shop.setWarehouseWardCode("200-W");

        when(userAddressRepository.findById(testAddressId)).thenReturn(Optional.of(address));
        when(shopRepository.findById(testShopId)).thenReturn(Optional.of(shop));
        when(ghnShippingClient.calculateFee(eq(200), eq("200-W"), eq(100), eq("100-W"), anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(25000L);

        long fee = shippingFeeService.calculateFeeForShop(testShopId, testAddressId, false);

        assertEquals(25000L, fee);
    }
}
