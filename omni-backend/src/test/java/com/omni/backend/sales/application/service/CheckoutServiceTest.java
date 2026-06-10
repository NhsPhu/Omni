package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import com.omni.backend.sales.application.dto.CheckoutRequest;
import com.omni.backend.sales.application.dto.CheckoutResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class CheckoutServiceTest {

    @Mock
    private CartService cartService;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ParentOrderRepository parentOrderRepository;



    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private LoyaltyTierRepository loyaltyTierRepository;

    @Mock
    private StockReservationService stockReservationService;

    @Mock
    private ShippingFeeService shippingFeeService;

    @Mock
    private VoucherApplicationService voucherApplicationService;

    @Mock
    private FlashSaleService flashSaleService;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private CheckoutService checkoutService;

    private final UUID testUserId = UUID.randomUUID();
    private final UUID testSkuId = UUID.randomUUID();
    private final UUID testShopId = UUID.randomUUID();
    private final UUID testAddressId = UUID.randomUUID();

    private UserJpaEntity testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(checkoutService, "flashSaleService", flashSaleService);

        testUser = new UserJpaEntity();
        testUser.setId(testUserId);
        testUser.setPinHash(null);
    }

    @Test
    void testCheckout_Success_COD() {
        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod("cod");
        request.setSkuIds(List.of(testSkuId));
        request.setShippingAddressId(testAddressId);

        CartItemDto cartItem = new CartItemDto();
        cartItem.setSkuId(testSkuId);
        cartItem.setShopId(testShopId);
        cartItem.setQuantity(2);

        Map<UUID, List<CartItemDto>> itemsByShop = new HashMap<>();
        itemsByShop.put(testShopId, List.of(cartItem));

        CartDto cart = new CartDto();
        cart.setItemsByShop(itemsByShop);

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setId(testSkuId);
        sku.setPrice(new BigDecimal("100000"));
        sku.setSkuCode("SKU-001");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(cartService.getCart(testUserId)).thenReturn(cart);
        when(productSkuRepository.findAllByIdIn(anyList())).thenReturn(List.of(sku));
        when(flashSaleService.getActiveFlashSalePrices(anyList())).thenReturn(new HashMap<>());
        when(shippingFeeService.calculateFeeForShop(eq(testShopId), eq(testAddressId), anyBoolean())).thenReturn(30000L);
        when(voucherApplicationService.applyShopVoucher(any(), any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(voucherApplicationService.applyShippingVoucher(any(), any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(voucherApplicationService.applyPlatformVoucher(any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(parentOrderRepository.save(any(ParentOrderJpaEntity.class))).thenAnswer(i -> {
            ParentOrderJpaEntity p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        CheckoutResponse response = checkoutService.checkout(testUserId, request);

        assertNotNull(response);
        assertEquals("PROCESSING", response.getStatus());
        // Subtotal = 2 * 100000 = 200000. Shipping = 30000. Total = 230000
        assertEquals(0, new BigDecimal("230000").compareTo(response.getTotalAmount()));
        
        verify(stockReservationService).reserveStockAndIncrementSold(eq(testSkuId), any(), eq(2), eq("SKU-001"));
        verify(cartService).removeFromCart(testUserId, testSkuId);
        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(com.omni.backend.sales.domain.event.OrderPlacedEvent.class));
    }

    @Test
    void testCheckout_InvalidPin() {
        testUser.setPinHash("hashed-pin");
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        CheckoutRequest request = new CheckoutRequest();
        request.setPin("wrong-pin");

        when(passwordEncoder.matches("wrong-pin", "hashed-pin")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            checkoutService.checkout(testUserId, request)
        );

        assertEquals("Mã PIN không chính xác hoặc chưa được cung cấp.", exception.getMessage());
    }

    @Test
    void testCheckout_EmptyCart() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        CartDto cart = new CartDto();
        cart.setItemsByShop(new HashMap<>());
        when(cartService.getCart(testUserId)).thenReturn(cart);

        CheckoutRequest request = new CheckoutRequest();
        request.setSkuIds(List.of(testSkuId));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            checkoutService.checkout(testUserId, request)
        );

        assertEquals("Cart is empty", exception.getMessage());
    }

    @Test
    void testCheckout_WithLoyaltyTierDiscount() {
        testUser.setLoyaltyTier("GOLD");
        
        LoyaltyTierJpaEntity tier = new LoyaltyTierJpaEntity();
        tier.setDiscountPercent(new BigDecimal("10")); // 10%

        CheckoutRequest request = new CheckoutRequest();
        request.setPaymentMethod("vnpay");
        request.setSkuIds(List.of(testSkuId));
        request.setShippingAddressId(testAddressId);

        CartItemDto cartItem = new CartItemDto();
        cartItem.setSkuId(testSkuId);
        cartItem.setShopId(testShopId);
        cartItem.setQuantity(1);

        Map<UUID, List<CartItemDto>> itemsByShop = new HashMap<>();
        itemsByShop.put(testShopId, List.of(cartItem));
        CartDto cart = new CartDto();
        cart.setItemsByShop(itemsByShop);

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setId(testSkuId);
        sku.setPrice(new BigDecimal("100000"));

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(loyaltyTierRepository.findById(testUser.getLoyaltyTier())).thenReturn(Optional.of(tier));
        when(cartService.getCart(testUserId)).thenReturn(cart);
        when(productSkuRepository.findAllByIdIn(anyList())).thenReturn(List.of(sku));
        when(shippingFeeService.calculateFeeForShop(eq(testShopId), eq(testAddressId), anyBoolean())).thenReturn(0L);
        when(voucherApplicationService.applyShopVoucher(any(), any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(voucherApplicationService.applyShippingVoucher(any(), any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(voucherApplicationService.applyPlatformVoucher(any(), any(), any())).thenReturn(BigDecimal.ZERO);
        when(parentOrderRepository.save(any(ParentOrderJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        CheckoutResponse response = checkoutService.checkout(testUserId, request);

        // 100000 total. Tier discount = 10% of 100000 = 10000. Final = 90000.
        assertEquals(0, new BigDecimal("100000").compareTo(response.getTotalAmount()));
        assertEquals(0, new BigDecimal("90000").compareTo(response.getFinalAmount()));
    }
}
