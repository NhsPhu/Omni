package com.omni.backend.sales.application.service;

import com.omni.backend.sales.adapter.persistence.entity.PlatformVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.UserVoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.PlatformVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.ShopVoucherRepository;
import com.omni.backend.sales.adapter.persistence.repository.UserVoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherApplicationServiceTest {

    @Mock
    private ShopVoucherRepository shopVoucherRepository;

    @Mock
    private PlatformVoucherRepository platformVoucherRepository;

    @Mock
    private UserVoucherRepository userVoucherRepository;

    @InjectMocks
    private VoucherApplicationService voucherApplicationService;

    private final UUID voucherId = UUID.randomUUID();
    private final UUID shopId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    
    private ShopVoucherJpaEntity shopVoucher;
    private PlatformVoucherJpaEntity platformVoucher;

    @BeforeEach
    void setUp() {
        ZonedDateTime now = ZonedDateTime.now();
        
        shopVoucher = new ShopVoucherJpaEntity();
        shopVoucher.setId(voucherId);
        shopVoucher.setShopId(shopId);
        shopVoucher.setValidFrom(now.minusDays(1));
        shopVoucher.setValidTo(now.plusDays(1));
        shopVoucher.setMinOrderValue(new BigDecimal("100000"));
        shopVoucher.setDiscountType("FIXED");
        shopVoucher.setDiscountValue(new BigDecimal("20000"));
        shopVoucher.setUsedCount(0);

        platformVoucher = new PlatformVoucherJpaEntity();
        platformVoucher.setId(voucherId);
        platformVoucher.setValidFrom(now.minusDays(1));
        platformVoucher.setValidTo(now.plusDays(1));
        platformVoucher.setMinOrderValue(new BigDecimal("100000"));
        platformVoucher.setDiscountType("PERCENTAGE");
        platformVoucher.setDiscountValue(new BigDecimal("10")); // 10%
        platformVoucher.setMaxDiscountAmount(new BigDecimal("15000"));
        platformVoucher.setCategory("SHIPPING");
        platformVoucher.setUsedCount(0);
    }

    @Test
    void testApplyShopVoucher_FixedAmount() {
        when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));
        when(userVoucherRepository.findByUserIdAndVoucherId(userId, voucherId)).thenReturn(Optional.of(new UserVoucherJpaEntity()));

        BigDecimal discount = voucherApplicationService.applyShopVoucher(voucherId, shopId, new BigDecimal("150000"), userId);

        assertEquals(new BigDecimal("20000"), discount);
        assertEquals(1, shopVoucher.getUsedCount());
        verify(userVoucherRepository).save(any(UserVoucherJpaEntity.class));
        verify(shopVoucherRepository).save(shopVoucher);
    }

    @Test
    void testApplyShopVoucher_PercentageWithMax() {
        shopVoucher.setDiscountType("PERCENTAGE");
        shopVoucher.setDiscountValue(new BigDecimal("20")); // 20%
        shopVoucher.setMaxDiscountAmount(new BigDecimal("25000"));

        when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));
        
        // 20% of 200,000 = 40,000. Capped at 25,000.
        BigDecimal discount = voucherApplicationService.applyShopVoucher(voucherId, shopId, new BigDecimal("200000"), userId);

        assertEquals(new BigDecimal("25000"), discount);
    }

    @Test
    void testApplyShopVoucher_InvalidConditions() {
        // Condition 1: Subtotal < Min Order Value
        when(shopVoucherRepository.findById(voucherId)).thenReturn(Optional.of(shopVoucher));
        BigDecimal discount1 = voucherApplicationService.applyShopVoucher(voucherId, shopId, new BigDecimal("50000"), userId);
        assertEquals(BigDecimal.ZERO, discount1);

        // Condition 2: Wrong Shop ID
        BigDecimal discount2 = voucherApplicationService.applyShopVoucher(voucherId, UUID.randomUUID(), new BigDecimal("150000"), userId);
        assertEquals(BigDecimal.ZERO, discount2);

        // Condition 3: Expired
        shopVoucher.setValidTo(ZonedDateTime.now().minusDays(2));
        BigDecimal discount3 = voucherApplicationService.applyShopVoucher(voucherId, shopId, new BigDecimal("150000"), userId);
        assertEquals(BigDecimal.ZERO, discount3);
    }

    @Test
    void testApplyShippingVoucher_Success() {
        when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));
        
        // Shipping fee = 30000, 10% = 3000.
        BigDecimal discount = voucherApplicationService.applyShippingVoucher(voucherId, new BigDecimal("30000"), new BigDecimal("150000"), userId);

        assertEquals(new BigDecimal("3000"), discount);
        verify(platformVoucherRepository).save(platformVoucher);
    }

    @Test
    void testApplyShippingVoucher_DiscountExceedsShippingFee() {
        platformVoucher.setDiscountType("FIXED");
        platformVoucher.setDiscountValue(new BigDecimal("50000")); // Flat 50k off shipping
        
        when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));
        
        // Shipping fee = 30000. Discount should be capped at 30000.
        BigDecimal discount = voucherApplicationService.applyShippingVoucher(voucherId, new BigDecimal("30000"), new BigDecimal("150000"), userId);

        assertEquals(new BigDecimal("30000"), discount);
    }

    @Test
    void testApplyPlatformVoucher_Success() {
        platformVoucher.setCategory("ALL");
        when(platformVoucherRepository.findById(voucherId)).thenReturn(Optional.of(platformVoucher));

        // Grand total = 200,000. 10% = 20,000. Capped at 15,000.
        BigDecimal discount = voucherApplicationService.applyPlatformVoucher(voucherId, new BigDecimal("200000"), userId);

        assertEquals(new BigDecimal("15000"), discount);
    }
}
