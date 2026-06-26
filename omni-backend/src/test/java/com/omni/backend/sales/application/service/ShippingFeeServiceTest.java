package com.omni.backend.sales.application.service;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserAddressJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.shipping.application.service.GhnShippingClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShippingFeeService Tests")
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

    private final UUID shopId = UUID.randomUUID();
    private final UUID addressId = UUID.randomUUID();

    private UserAddressJpaEntity testAddress;
    private ShopJpaEntity testShop;

    @BeforeEach
    void setUp() {
        testAddress = new UserAddressJpaEntity();
        testAddress.setId(addressId);
        testAddress.setGhnDistrictId(3695);
        testAddress.setGhnWardCode("90746");

        testShop = ShopJpaEntity.builder()
                .id(shopId)
                .name("Test Shop")
                .warehouseDistrictId(1442)
                .warehouseWardCode("20109")
                .build();
    }

    @Nested
    @DisplayName("calculateFeeForShop() - Tính phí vận chuyển cho từng shop")
    class CalculateFeeForShopTests {

        @Test
        @DisplayName("✅ Trả về 0 nếu user đủ điều kiện freeship")
        void calculateFeeForShop_Freeship_ReturnsZero() {
            long fee = shippingFeeService.calculateFeeForShop(shopId, addressId, true);
            assertEquals(0, fee);
            verifyNoInteractions(ghnShippingClient, userAddressRepository, shopRepository);
        }

        @Test
        @DisplayName("✅ Tính phí dựa theo địa chỉ shop và địa chỉ nhận hàng")
        void calculateFeeForShop_WithAddress_CallsGhn() {
            when(userAddressRepository.findById(addressId)).thenReturn(Optional.of(testAddress));
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));
            when(ghnShippingClient.calculateFee(anyInt(), anyString(), anyInt(), anyString(),
                    anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(30000L);

            long fee = shippingFeeService.calculateFeeForShop(shopId, addressId, false);

            assertEquals(30000L, fee);
            verify(ghnShippingClient).calculateFee(
                    eq(1442), eq("20109"), eq(3695), eq("90746"),
                    anyInt(), anyInt(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("✅ Dùng giá trị mặc định nếu address không tồn tại")
        void calculateFeeForShop_AddressNotFound_UsesDefaults() {
            when(userAddressRepository.findById(addressId)).thenReturn(Optional.empty());
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));
            when(ghnShippingClient.calculateFee(anyInt(), anyString(), anyInt(), anyString(),
                    anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(25000L);

            long fee = shippingFeeService.calculateFeeForShop(shopId, addressId, false);

            assertEquals(25000L, fee);
            // Falls back to default district 1442, ward 20109
            verify(ghnShippingClient).calculateFee(
                    eq(1442), eq("20109"), eq(1442), eq("20109"),
                    anyInt(), anyInt(), anyInt(), anyInt());
        }

        @Test
        @DisplayName("✅ Xử lý đúng khi addressId null")
        void calculateFeeForShop_NullAddress_UsesDefaults() {
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));
            when(ghnShippingClient.calculateFee(anyInt(), anyString(), anyInt(), anyString(),
                    anyInt(), anyInt(), anyInt(), anyInt())).thenReturn(28000L);

            long fee = shippingFeeService.calculateFeeForShop(shopId, null, false);

            assertEquals(28000L, fee);
        }
    }
}
