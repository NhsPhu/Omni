package com.omni.backend.sales.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omni.backend.catalog.adapter.persistence.entity.ProductJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductImageRepository;
import com.omni.backend.catalog.adapter.persistence.entity.ProductImageJpaEntity;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final ProductImageRepository productImageRepository;
    private final ShopRepository shopRepository;
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private FlashSaleService flashSaleService;

    private static final String CART_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(7);

    public CartDto getCart(UUID userId) {
        String key = CART_PREFIX + userId.toString();
        String cartJson = redisTemplate.opsForValue().get(key);
        
        if (cartJson == null) {
            return CartDto.builder().userId(userId).itemsByShop(new HashMap<>()).build();
        }

        try {
            List<CartItemDto> items = objectMapper.readValue(cartJson, new TypeReference<List<CartItemDto>>() {});
            
            // Re-validate prices globally
            List<UUID> skuIds = items.stream().map(CartItemDto::getSkuId).toList();
            Map<UUID, BigDecimal> flashSalePrices = flashSaleService.getActiveFlashSalePrices(skuIds);
            
            for (CartItemDto item : items) {
                // By default, it could be stale in Redis, but we don't query DB every time to save performance
                // However, we MUST apply flash sale price if active
                if (flashSalePrices.containsKey(item.getSkuId())) {
                    item.setPrice(flashSalePrices.get(item.getSkuId()));
                } else {
                    productSkuRepository.findById(item.getSkuId()).ifPresent(sku -> {
                        item.setPrice(sku.getPrice());
                        item.setOriginalPrice(sku.getOriginalPrice());
                    });
                }
            }
            
            Map<UUID, List<CartItemDto>> grouped = items.stream().collect(Collectors.groupingBy(CartItemDto::getShopId));
            return CartDto.builder().userId(userId).itemsByShop(grouped).build();
        } catch (JsonProcessingException e) {
            log.error("Failed to parse cart for user {}", userId, e);
            return CartDto.builder().userId(userId).itemsByShop(new HashMap<>()).build();
        }
    }

    public void addToCart(UUID userId, UUID skuId, int quantity) {
        addToCart(userId, skuId, quantity, false);
    }

    public void addToCart(UUID userId, UUID skuId, int quantity, boolean overwrite) {
        // Fetch fresh product info
        ProductSkuJpaEntity sku = productSkuRepository.findById(skuId)
                .orElseThrow(() -> new RuntimeException("SKU not found"));
        ProductJpaEntity product = productRepository.findById(sku.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (sku.getStockQuantity() < quantity) {
            throw new RuntimeException("Not enough stock");
        }

        String key = CART_PREFIX + userId.toString();
        List<CartItemDto> items = getRawCartItems(key);

        // Check if exists
        Optional<CartItemDto> existingItem = items.stream()
                .filter(i -> i.getSkuId().equals(skuId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItemDto item = existingItem.get();
            item.setQuantity(overwrite ? quantity : item.getQuantity() + quantity);
            // Refresh price in case it changed
            item.setPrice(sku.getPrice());
            item.setOriginalPrice(sku.getOriginalPrice());
        } else {
            String shopName = shopRepository.findById(product.getShopId())
                    .map(ShopJpaEntity::getName)
                    .orElse("Unknown Shop");
            
            // Try to find image url from product or sku
            String primaryImage = null;
            List<ProductImageJpaEntity> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId());
            if (images != null && !images.isEmpty()) {
                primaryImage = images.get(0).getImageUrl();
            }

            items.add(CartItemDto.builder()
                    .productId(product.getId())
                    .skuId(skuId)
                    .shopId(product.getShopId())
                    .shopName(shopName)
                    .productName(product.getName())
                    .skuCode(sku.getSkuCode())
                    .price(sku.getPrice())
                    .originalPrice(sku.getOriginalPrice())
                    .quantity(quantity)
                    .imageUrl(primaryImage)
                    .build());
        }

        saveCart(key, items);
    }

    public void updateCartItemQuantity(UUID userId, UUID skuId, int quantity) {
        if (quantity <= 0) {
            removeFromCart(userId, skuId);
            return;
        }

        String key = CART_PREFIX + userId.toString();
        List<CartItemDto> items = getRawCartItems(key);

        items.stream()
                .filter(i -> i.getSkuId().equals(skuId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(quantity));

        saveCart(key, items);
    }

    public void removeFromCart(UUID userId, UUID skuId) {
        String key = CART_PREFIX + userId.toString();
        List<CartItemDto> items = getRawCartItems(key);
        
        items.removeIf(i -> i.getSkuId().equals(skuId));
        saveCart(key, items);
    }

    public void clearCart(UUID userId) {
        redisTemplate.delete(CART_PREFIX + userId.toString());
    }

    private List<CartItemDto> getRawCartItems(String key) {
        String cartJson = redisTemplate.opsForValue().get(key);
        if (cartJson == null) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(cartJson, new TypeReference<List<CartItemDto>>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to parse cart for key {}", key, e);
            return new ArrayList<>();
        }
    }

    private void saveCart(String key, List<CartItemDto> items) {
        try {
            String json = objectMapper.writeValueAsString(items);
            redisTemplate.opsForValue().set(key, json, CART_TTL);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize cart for key {}", key, e);
            throw new RuntimeException("Failed to save cart");
        }
    }
}
