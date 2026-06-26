package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.dto.ShopRegistrationDto;
import com.omni.backend.iam.application.dto.ShopResponseDto;
import com.omni.backend.iam.application.dto.ShopUpdateDto;
import com.omni.backend.iam.domain.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShopService Tests")
class ShopServiceTest {

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShopService shopService;

    private final UUID ownerId = UUID.randomUUID();
    private final UUID shopId = UUID.randomUUID();

    private UserJpaEntity testUser;
    private ShopJpaEntity testShop;
    private ShopRegistrationDto registrationDto;

    @BeforeEach
    void setUp() {
        testUser = UserJpaEntity.builder()
                .id(ownerId)
                .email("owner@example.com")
                .fullName("Shop Owner")
                .role(Role.ROLE_CUSTOMER)
                .build();

        testShop = ShopJpaEntity.builder()
                .id(shopId)
                .ownerId(ownerId)
                .name("Omni Test Shop")
                .description("A test shop")
                .status("ACTIVE")
                .rating(BigDecimal.ZERO)
                .totalSales(0)
                .build();

        registrationDto = new ShopRegistrationDto();
        registrationDto.setName("My New Shop");
        registrationDto.setDescription("Description");
        registrationDto.setAddress("123 Main St");
        registrationDto.setPickupAddress("123 Main St");
        registrationDto.setBankName("Vietcombank");
        registrationDto.setBankAccountNumber("1234567890");
        registrationDto.setBankAccountName("NGUYEN VAN A");
        registrationDto.setWarehouseProvinceId(201);
        registrationDto.setWarehouseDistrictId(3695);
        registrationDto.setWarehouseWardCode("90746");
    }

    @Nested
    @DisplayName("registerShop()")
    class RegisterShopTests {

        @Test
        @DisplayName("✅ Đăng ký shop thành công khi user chưa có shop")
        void registerShop_Success() {
            when(shopRepository.findByOwnerId(ownerId)).thenReturn(Optional.empty());
            when(shopRepository.save(any(ShopJpaEntity.class))).thenAnswer(inv -> {
                ShopJpaEntity s = inv.getArgument(0);
                s.setId(shopId);
                return s;
            });

            ShopResponseDto response = shopService.registerShop(ownerId, registrationDto);

            assertNotNull(response);
            assertEquals("My New Shop", response.getName());
            assertEquals("PENDING_REVIEW", response.getStatus());
            assertNotNull(response.getMessage());
            verify(shopRepository).save(any(ShopJpaEntity.class));
        }

        @Test
        @DisplayName("❌ Lỗi nếu user đã có shop")
        void registerShop_AlreadyHasShop_ThrowsException() {
            when(shopRepository.findByOwnerId(ownerId)).thenReturn(Optional.of(testShop));

            assertThrows(IllegalArgumentException.class,
                    () -> shopService.registerShop(ownerId, registrationDto));

            verify(shopRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getShopByOwner()")
    class GetMyShopTests {

        @Test
        @DisplayName("✅ Lấy thông tin shop theo ownerId thành công")
        void getShopByOwner_Success() {
            when(shopRepository.findByOwnerId(ownerId)).thenReturn(Optional.of(testShop));

            ShopResponseDto response = shopService.getShopByOwner(ownerId);

            assertNotNull(response);
            assertEquals(shopId, response.getId());
            assertEquals("Omni Test Shop", response.getName());
        }

        @Test
        @DisplayName("✅ Tự động tạo demo shop nếu user chưa có shop")
        void getShopByOwner_NoShop_CreatesDemo() {
            when(shopRepository.findByOwnerId(ownerId)).thenReturn(Optional.empty());
            when(shopRepository.save(any(ShopJpaEntity.class))).thenAnswer(inv -> {
                ShopJpaEntity s = inv.getArgument(0);
                s.setId(UUID.randomUUID());
                return s;
            });

            ShopResponseDto response = shopService.getShopByOwner(ownerId);

            assertNotNull(response);
            assertEquals("Demo Shop", response.getName());
        }
    }

    @Nested
    @DisplayName("updateShop()")
    class UpdateShopTests {

        @Test
        @DisplayName("✅ Cập nhật thông tin shop thành công")
        void updateShop_Success() {
            ShopUpdateDto updateDto = new ShopUpdateDto();
            updateDto.setName("Updated Shop Name");
            updateDto.setDescription("Updated Description");

            when(shopRepository.findByOwnerId(ownerId)).thenReturn(Optional.of(testShop));
            when(shopRepository.save(any(ShopJpaEntity.class))).thenAnswer(inv -> inv.getArgument(0));

            ShopResponseDto response = shopService.updateShop(ownerId, updateDto);

            assertNotNull(response);
            assertEquals("Updated Shop Name", response.getName());
            assertEquals("Updated Description", response.getDescription());
        }
    }

    @Nested
    @DisplayName("Admin: approveShop()")
    class AdminShopTests {

        private final UUID adminId = UUID.randomUUID();

        @Test
        @DisplayName("✅ Admin duyệt shop thành công, status -> ACTIVE, owner -> ROLE_VENDOR")
        void approveShop_Success() {
            testShop.setStatus("PENDING_REVIEW");
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));
            when(userRepository.findById(ownerId)).thenReturn(Optional.of(testUser));
            when(shopRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            shopService.approveShop(shopId, adminId, true, null);

            assertEquals("ACTIVE", testShop.getStatus());
            verify(shopRepository).save(testShop);
        }

        @Test
        @DisplayName("✅ Admin từ chối shop thành công, status -> REJECTED")
        void rejectShop_Success() {
            testShop.setStatus("PENDING_REVIEW");
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));
            when(shopRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            shopService.approveShop(shopId, adminId, false, "Thông tin không hợp lệ");

            assertEquals("REJECTED", testShop.getStatus());
            verify(shopRepository).save(testShop);
        }

        @Test
        @DisplayName("❌ Lỗi nếu shop không tồn tại khi admin duyệt")
        void approveShop_NotFound_ThrowsException() {
            when(shopRepository.findById(shopId)).thenReturn(Optional.empty());

            assertThrows(IllegalArgumentException.class, () -> shopService.approveShop(shopId, adminId, true, null));
        }

        @Test
        @DisplayName("❌ Lỗi nếu shop không ở trạng thái PENDING_REVIEW")
        void approveShop_NotPending_ThrowsException() {
            testShop.setStatus("ACTIVE");
            when(shopRepository.findById(shopId)).thenReturn(Optional.of(testShop));

            assertThrows(IllegalStateException.class, () -> shopService.approveShop(shopId, adminId, true, null));
        }
    }
}
