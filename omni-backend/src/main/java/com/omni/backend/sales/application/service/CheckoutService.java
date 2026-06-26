package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.OrderItemJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.application.dto.CartDto;
import com.omni.backend.sales.application.dto.CartItemDto;
import com.omni.backend.sales.application.dto.CheckoutRequest;
import com.omni.backend.sales.application.dto.CheckoutResponse;
import com.omni.backend.sales.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.omni.backend.shared.config.RabbitMQConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutService {

    private final CartService cartService;
    private final ProductSkuRepository productSkuRepository;
    private final ParentOrderRepository parentOrderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoyaltyTierRepository loyaltyTierRepository;
    
    // Injected Facade Services
    private final StockReservationService stockReservationService;
    private final ShippingFeeService shippingFeeService;
    private final VoucherApplicationService voucherApplicationService;
    
    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private FlashSaleService flashSaleService;

    @Transactional(rollbackFor = Exception.class)
    public CheckoutResponse checkout(UUID userId, CheckoutRequest request) {
        log.info("Starting checkout process for user {}", userId);

        UserJpaEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPinHash() != null && !user.getPinHash().isEmpty()) {
            if (request.getPin() == null || !passwordEncoder.matches(request.getPin(), user.getPinHash())) {
                throw new RuntimeException("Mã PIN không chính xác hoặc chưa được cung cấp.");
            }
        }

        CartDto cart = cartService.getCart(userId);
        if (cart.getItemsByShop().isEmpty()) throw new RuntimeException("Cart is empty");

        List<CartItemDto> selectedItems = cart.getItemsByShop().values().stream()
                .flatMap(List::stream)
                .filter(item -> request.getSkuIds().contains(item.getSkuId()))
                .collect(Collectors.toList());

        if (selectedItems.isEmpty()) throw new RuntimeException("No valid items selected for checkout");

        Map<UUID, List<CartItemDto>> itemsByShop = selectedItems.stream().collect(Collectors.groupingBy(CartItemDto::getShopId));

        String initialStatus = "cod".equalsIgnoreCase(request.getPaymentMethod()) ? "PROCESSING" : "PENDING";

        ParentOrderJpaEntity parentOrder = ParentOrderJpaEntity.builder()
                .userId(userId)
                .shippingAddressId(request.getShippingAddressId())
                .platformVoucherId(request.getPlatformVoucherId())
                .status(initialStatus)
                .build();

        BigDecimal tierDiscountPercent = BigDecimal.ZERO;
        boolean isFreeshipEligible = false;
        
        if (user.getLoyaltyTier() != null) {
            var tierOpt = loyaltyTierRepository.findById(user.getLoyaltyTier());
            if (tierOpt.isPresent()) {
                if (tierOpt.get().getDiscountPercent() != null) tierDiscountPercent = tierOpt.get().getDiscountPercent();
                if (Boolean.TRUE.equals(tierOpt.get().getFreeshipEligible())) isFreeshipEligible = true;
            }
        }

        BigDecimal grandTotal = BigDecimal.ZERO;
        
        List<UUID> allSkuIds = selectedItems.stream().map(CartItemDto::getSkuId).toList();
        Map<UUID, ProductSkuJpaEntity> skuMap = productSkuRepository.findAllByIdIn(allSkuIds).stream()
                .collect(Collectors.toMap(ProductSkuJpaEntity::getId, s -> s));
        Map<UUID, BigDecimal> flashSalePrices = flashSaleService.getActiveFlashSalePrices(allSkuIds);

        for (Map.Entry<UUID, List<CartItemDto>> entry : itemsByShop.entrySet()) {
            UUID shopId = entry.getKey();
            List<CartItemDto> shopItems = entry.getValue();

            BigDecimal shopSubtotal = BigDecimal.ZERO;
            String shopName = shopItems.isEmpty() ? "Unknown Shop" : shopItems.get(0).getShopName();
            
            long shippingFee = shippingFeeService.calculateFeeForShop(shopId, request.getShippingAddressId(), isFreeshipEligible);
            
            ChildOrderJpaEntity childOrder = ChildOrderJpaEntity.builder()
                    .parentOrder(parentOrder)
                    .shopId(shopId)
                    .shopName(shopName)
                    .status(initialStatus)
                    .shippingFee(BigDecimal.valueOf(shippingFee))
                    .build();

            for (CartItemDto item : shopItems) {
                ProductSkuJpaEntity sku = skuMap.get(item.getSkuId());
                if (sku == null) throw new RuntimeException("SKU not found: " + item.getSkuId());
                
                // Trừ tồn kho & tăng lượt bán
                stockReservationService.reserveStockAndIncrementSold(item.getSkuId(), item.getProductId(), item.getQuantity(), sku.getSkuCode());

                BigDecimal finalPrice = sku.getPrice();
                if (flashSalePrices.containsKey(sku.getId())) {
                    if (flashSaleService.recordFlashSalePurchase(userId, sku.getId(), item.getQuantity())) {
                        finalPrice = flashSalePrices.get(sku.getId());
                    }
                }

                BigDecimal itemTotal = finalPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                shopSubtotal = shopSubtotal.add(itemTotal);

                childOrder.getItems().add(OrderItemJpaEntity.builder()
                        .childOrder(childOrder)
                        .productId(item.getProductId())
                        .skuId(item.getSkuId())
                        .productName(item.getProductName())
                        .imageUrl(item.getImageUrl())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(finalPrice)
                        .build());
            }

            BigDecimal shopDiscount = BigDecimal.ZERO;
            if (request.getShopVoucherIds() != null && !request.getShopVoucherIds().isEmpty()) {
                shopDiscount = voucherApplicationService.applyShopVoucher(request.getShopVoucherIds(), shopId, shopSubtotal, userId);
            }
            
            childOrder.setSubtotal(shopSubtotal);
            childOrder.setShopDiscount(shopDiscount);
            childOrder.setTotalAmount(shopSubtotal.add(childOrder.getShippingFee()).subtract(childOrder.getShopDiscount()));
            
            parentOrder.getChildOrders().add(childOrder);
            grandTotal = grandTotal.add(childOrder.getTotalAmount());
        }

        BigDecimal totalShippingFee = parentOrder.getChildOrders().stream()
                .map(ChildOrderJpaEntity::getShippingFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingDiscount = voucherApplicationService.applyShippingVoucher(request.getShippingVoucherId(), totalShippingFee, grandTotal, userId);
        BigDecimal platformDiscount = voucherApplicationService.applyPlatformVoucher(request.getPlatformVoucherId(), grandTotal, userId);

        if (tierDiscountPercent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal tierDiscountAmount = grandTotal.multiply(tierDiscountPercent).divide(BigDecimal.valueOf(100));
            platformDiscount = platformDiscount.add(tierDiscountAmount);
        }

        parentOrder.setShippingDiscount(shippingDiscount);
        parentOrder.setPlatformDiscount(platformDiscount);
        parentOrder.setTotalAmount(grandTotal);
        parentOrder.setFinalAmount(grandTotal.subtract(platformDiscount).subtract(shippingDiscount));

        parentOrder = parentOrderRepository.save(parentOrder);

        for (UUID skuId : request.getSkuIds()) {
            cartService.removeFromCart(userId, skuId);
        }

        if ("cod".equalsIgnoreCase(request.getPaymentMethod())) {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_ORDER_PLACED, new OrderPlacedEvent(parentOrder.getId(), userId, parentOrder.getFinalAmount()));
        }

        log.info("Checkout successful for user {}, ParentOrder ID: {}", userId, parentOrder.getId());
        
        return CheckoutResponse.builder()
                .parentOrderId(parentOrder.getId())
                .totalAmount(parentOrder.getTotalAmount())
                .finalAmount(parentOrder.getFinalAmount())
                .platformDiscount(parentOrder.getPlatformDiscount())
                .shippingDiscount(parentOrder.getShippingDiscount())
                .status(parentOrder.getStatus())
                .build();
    }

    public long calculateShippingFee(UUID addressId, UUID userId) {
        return shippingFeeService.calculateShippingFee(addressId, userId);
    }
}
