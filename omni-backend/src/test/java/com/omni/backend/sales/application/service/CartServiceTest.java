package com.omni.backend.sales.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omni.backend.catalog.adapter.persistence.entity.ProductJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductImageRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private FlashSaleService flashSaleService;

    @InjectMocks
    private CartService cartService;

    private final UUID testUserId = UUID.randomUUID();
    private final UUID testSkuId = UUID.randomUUID();
    private final UUID testProductId = UUID.randomUUID();
    private final UUID testShopId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // ReflectionTestUtils allows setting autowired but not constructor injected fields
        ReflectionTestUtils.setField(cartService, "flashSaleService", flashSaleService);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testGetCart_EmptyCart() {
        when(valueOperations.get("cart:" + testUserId.toString())).thenReturn(null);

        CartDto cart = cartService.getCart(testUserId);

        assertNotNull(cart);
        assertEquals(testUserId, cart.getUserId());
        assertTrue(cart.getItemsByShop().isEmpty());
    }

    @Test
    void testGetCart_WithItems() throws JsonProcessingException {
        String cartJson = "[{\"skuId\":\"" + testSkuId + "\", \"shopId\":\"" + testShopId + "\", \"price\":100000}]";
        
        CartItemDto item = new CartItemDto();
        item.setSkuId(testSkuId);
        item.setShopId(testShopId);
        item.setPrice(new BigDecimal("100000"));

        when(valueOperations.get("cart:" + testUserId.toString())).thenReturn(cartJson);
        when(objectMapper.readValue(eq(cartJson), any(TypeReference.class))).thenReturn(List.of(item));
        when(flashSaleService.getActiveFlashSalePrices(anyList())).thenReturn(new HashMap<>());
        
        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setPrice(new BigDecimal("120000"));
        sku.setOriginalPrice(new BigDecimal("150000"));
        when(productSkuRepository.findById(testSkuId)).thenReturn(Optional.of(sku));

        CartDto cart = cartService.getCart(testUserId);

        assertNotNull(cart);
        assertFalse(cart.getItemsByShop().isEmpty());
        CartItemDto updatedItem = cart.getItemsByShop().get(testShopId).get(0);
        
        // Price should be updated from DB
        assertEquals(new BigDecimal("120000"), updatedItem.getPrice());
    }

    @Test
    void testAddToCart_NewItem() throws JsonProcessingException {
        int quantity = 2;

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setId(testSkuId);
        sku.setProductId(testProductId);
        sku.setStockQuantity(10);
        sku.setPrice(new BigDecimal("50000"));
        sku.setOriginalPrice(new BigDecimal("60000"));

        ProductJpaEntity product = new ProductJpaEntity();
        product.setId(testProductId);
        product.setShopId(testShopId);
        product.setName("Test Product");

        ShopJpaEntity shop = new ShopJpaEntity();
        shop.setName("Test Shop");

        when(productSkuRepository.findById(testSkuId)).thenReturn(Optional.of(sku));
        when(productRepository.findById(testProductId)).thenReturn(Optional.of(product));
        when(valueOperations.get("cart:" + testUserId)).thenReturn(null);
        when(shopRepository.findById(testShopId)).thenReturn(Optional.of(shop));
        when(productImageRepository.findByProductIdOrderBySortOrderAsc(testProductId)).thenReturn(new ArrayList<>());
        when(objectMapper.writeValueAsString(anyList())).thenReturn("updated-json");

        cartService.addToCart(testUserId, testSkuId, quantity);

        verify(valueOperations).set(eq("cart:" + testUserId), eq("updated-json"), any(Duration.class));
    }

    @Test
    void testAddToCart_NotEnoughStock() {
        int quantity = 5;

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setId(testSkuId);
        sku.setProductId(testProductId);
        sku.setStockQuantity(2); // Less than quantity requested

        ProductJpaEntity product = new ProductJpaEntity();
        product.setId(testProductId);

        when(productSkuRepository.findById(testSkuId)).thenReturn(Optional.of(sku));
        when(productRepository.findById(testProductId)).thenReturn(Optional.of(product));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> cartService.addToCart(testUserId, testSkuId, quantity));
        assertEquals("Not enough stock", exception.getMessage());
    }

    @Test
    void testClearCart() {
        cartService.clearCart(testUserId);
        verify(redisTemplate).delete("cart:" + testUserId);
    }
}
