package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.UserVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.UserVoucherRepository;
import com.omni.backend.sales.application.dto.UserVoucherDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserVoucherService Tests")
class UserVoucherServiceTest {

    @Mock
    private UserVoucherRepository userVoucherRepository;

    @Mock
    private PlatformVoucherRepository platformVoucherRepository;

    @Mock
    private ShopVoucherRepository shopVoucherRepository;

    @InjectMocks
    private UserVoucherService userVoucherService;

    private final UUID userId = UUID.randomUUID();
    private final UUID voucherId = UUID.randomUUID();
    private final UUID shopId = UUID.randomUUID();

    private PlatformVoucherJpaEntity platformVoucher;
    private ShopVoucherJpaEntity shopVoucher;

    @BeforeEach
    void setUp() {
        ZonedDateTime now = ZonedDateTime.now();

        platformVoucher = new PlatformVoucherJpaEntity();
        platformVoucher.setId(voucherId);
        platformVoucher.setCode("PLATFORM10");
        platformVoucher.setCategory("OMNI");
        platformVoucher.setDiscountType("PERCENTAGE");
        platformVoucher.setDiscountValue(new BigDecimal("10"));
        platformVoucher.setMinOrderValue(new BigDecimal("100000"));
        platformVoucher.setMaxDiscountAmount(new BigDecimal("15000"));
        platformVoucher.setValidFrom(now.minusDays(1));
        platformVoucher.setValidTo(now.plusDays(7));
        platformVoucher.setUsageLimit(100);
        platformVoucher.setUsedCount(50);

        shopVoucher = new ShopVoucherJpaEntity();
        shopVoucher.setId(voucherId);
        shopVoucher.setCode("SHOP20K");
        shopVoucher.setShopId(shopId);
        shopVoucher.setDiscountType("FIXED");
        shopVoucher.setDiscountValue(new BigDecimal("20000"));
        shopVoucher.setMinOrderValue(new BigDecimal("150000"));
        shopVoucher.setValidFrom(now.minusDays(1));
        shopVoucher.setValidTo(now.plusDays(5));
        shopVoucher.setUsageLimit(50);
        shopVoucher.setUsedCount(10);
    }

    @Nested
    @DisplayName("saveVoucher() - Lưu voucher vào tài khoản user")
    class SaveVoucherTests {

        @Test
        @DisplayName("✅ Lưu Platform Voucher thành công")
        void saveVoucher_Platform_Success() {
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);
            when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));
            when(userVoucherRepository.save(any(UserVoucherJpaEntity.class))).thenAnswer(inv -> inv.getArgument(0));

            UserVoucherDto result = userVoucherService.saveVoucher(userId, voucherId, "PLATFORM");

            assertNotNull(result);
            assertEquals(voucherId, result.getVoucherId());
            assertEquals("PLATFORM", result.getVoucherType());
            assertFalse(result.getIsUsed());
            verify(userVoucherRepository).save(any(UserVoucherJpaEntity.class));
        }

        @Test
        @DisplayName("✅ Lưu Shop Voucher thành công")
        void saveVoucher_Shop_Success() {
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);
            when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));
            when(userVoucherRepository.save(any(UserVoucherJpaEntity.class))).thenAnswer(inv -> inv.getArgument(0));

            UserVoucherDto result = userVoucherService.saveVoucher(userId, voucherId, "SHOP");

            assertNotNull(result);
            assertEquals("SHOP", result.getVoucherType());
        }

        @Test
        @DisplayName("❌ Lỗi nếu user đã lưu voucher này trước đó")
        void saveVoucher_AlreadySaved_ThrowsException() {
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(true);

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> userVoucherService.saveVoucher(userId, voucherId, "PLATFORM"));
            assertEquals("Voucher đã được lưu", ex.getMessage());
            verify(userVoucherRepository, never()).save(any());
        }

        @Test
        @DisplayName("❌ Lỗi nếu Platform Voucher không tồn tại")
        void saveVoucher_PlatformNotFound_ThrowsException() {
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);
            when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class,
                    () -> userVoucherService.saveVoucher(userId, voucherId, "PLATFORM"));
        }

        @Test
        @DisplayName("❌ Lỗi nếu Platform Voucher đã hết lượt dùng")
        void saveVoucher_PlatformExhausted_ThrowsException() {
            platformVoucher.setUsedCount(100); // usedCount == usageLimit
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);
            when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> userVoucherService.saveVoucher(userId, voucherId, "PLATFORM"));
            assertEquals("Voucher đã hết lượt sử dụng", ex.getMessage());
        }

        @Test
        @DisplayName("❌ Lỗi nếu Shop Voucher đã hết lượt dùng")
        void saveVoucher_ShopExhausted_ThrowsException() {
            shopVoucher.setUsedCount(50); // usedCount == usageLimit
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);
            when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> userVoucherService.saveVoucher(userId, voucherId, "SHOP"));
            assertEquals("Voucher đã hết lượt sử dụng", ex.getMessage());
        }

        @Test
        @DisplayName("❌ Lỗi nếu loại voucher không hợp lệ")
        void saveVoucher_InvalidType_ThrowsException() {
            when(userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)).thenReturn(false);

            assertThrows(IllegalArgumentException.class,
                    () -> userVoucherService.saveVoucher(userId, voucherId, "INVALID_TYPE"));
        }
    }

    @Nested
    @DisplayName("getMyVouchers() - Lấy danh sách voucher của user")
    class GetMyVouchersTests {

        @Test
        @DisplayName("✅ Lấy danh sách chỉ bao gồm voucher còn hạn")
        void getMyVouchers_FilterExpiredVouchers() {
            ZonedDateTime now = ZonedDateTime.now();

            // Voucher hết hạn
            PlatformVoucherJpaEntity expiredVoucher = new PlatformVoucherJpaEntity();
            expiredVoucher.setId(UUID.randomUUID());
            expiredVoucher.setValidTo(now.minusDays(1));

            UserVoucherJpaEntity uvActive = new UserVoucherJpaEntity();
            uvActive.setId(UUID.randomUUID());
            uvActive.setVoucherId(voucherId);
            uvActive.setVoucherType("PLATFORM");
            uvActive.setIsUsed(false);

            UserVoucherJpaEntity uvExpired = new UserVoucherJpaEntity();
            UUID expiredId = UUID.randomUUID();
            uvExpired.setId(UUID.randomUUID());
            uvExpired.setVoucherId(expiredId);
            uvExpired.setVoucherType("PLATFORM");
            uvExpired.setIsUsed(false);

            when(userVoucherRepository.findByUserId(userId)).thenReturn(List.of(uvActive, uvExpired));
            when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));
            when(platformVoucherRepository.findById(expiredId)).thenReturn(Optional.of(expiredVoucher));

            List<UserVoucherDto> result = userVoucherService.getMyVouchers(userId);

            // Chỉ trả về 1 voucher còn hạn
            assertEquals(1, result.size());
            assertEquals(voucherId, result.get(0).getVoucherId());
        }

        @Test
        @DisplayName("✅ Category của Platform Voucher được trả về đúng")
        void getMyVouchers_PlatformCategoryMapped() {
            UserVoucherJpaEntity uv = new UserVoucherJpaEntity();
            uv.setId(UUID.randomUUID());
            uv.setVoucherId(voucherId);
            uv.setVoucherType("PLATFORM");
            uv.setIsUsed(false);

            when(userVoucherRepository.findByUserId(userId)).thenReturn(List.of(uv));
            when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));

            List<UserVoucherDto> result = userVoucherService.getMyVouchers(userId);

            assertEquals(1, result.size());
            assertEquals("OMNI", result.get(0).getCategory());
            assertEquals("PLATFORM10", result.get(0).getCode());
        }

        @Test
        @DisplayName("✅ Shop Voucher trả về đúng shopId")
        void getMyVouchers_ShopVoucherMapped() {
            UserVoucherJpaEntity uv = new UserVoucherJpaEntity();
            uv.setId(UUID.randomUUID());
            uv.setVoucherId(voucherId);
            uv.setVoucherType("SHOP");
            uv.setIsUsed(false);

            when(userVoucherRepository.findByUserId(userId)).thenReturn(List.of(uv));
            when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));

            List<UserVoucherDto> result = userVoucherService.getMyVouchers(userId);

            assertEquals(1, result.size());
            assertEquals(shopId, result.get(0).getShopId());
            assertEquals("SHOP20K", result.get(0).getCode());
        }

        @Test
        @DisplayName("✅ Trả về danh sách rỗng nếu user không có voucher")
        void getMyVouchers_EmptyList() {
            when(userVoucherRepository.findByUserId(userId)).thenReturn(List.of());

            List<UserVoucherDto> result = userVoucherService.getMyVouchers(userId);

            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }
}
