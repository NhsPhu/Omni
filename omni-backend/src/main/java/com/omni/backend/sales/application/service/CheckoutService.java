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
import com.omni.backend.sales.adapter.persistence.entity.VoucherJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.VoucherRepository;
import com.omni.backend.sales.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
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
    private final VoucherRepository voucherRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.omni.backend.shipping.application.service.GhnShippingClient ghnShippingClient;
    private final com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository userAddressRepository;
    private final com.omni.backend.iam.adapter.persistence.repository.ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        // 1. Lấy thông tin giỏ hàng
        CartDto cart = cartService.getCart(userId);
        if (cart.getItemsByShop().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Lọc các items người dùng chọn checkout (skuIds)
        List<CartItemDto> selectedItems = cart.getItemsByShop().values().stream()
                .flatMap(List::stream)
                .filter(item -> request.getSkuIds().contains(item.getSkuId()))
                .collect(Collectors.toList());

        if (selectedItems.isEmpty()) {
            throw new RuntimeException("No valid items selected for checkout");
        }

        // Group lại theo shop
        Map<UUID, List<CartItemDto>> itemsByShop = selectedItems.stream()
                .collect(Collectors.groupingBy(CartItemDto::getShopId));

        // 2. Validate và tạo Parent Order
        ParentOrderJpaEntity parentOrder = ParentOrderJpaEntity.builder()
                .userId(userId)
                .shippingAddressId(request.getShippingAddressId())
                .platformVoucherId(request.getPlatformVoucherId())
                .status("PENDING")
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;
        
        // 3. Xử lý từng Shop (Child Order)
        for (Map.Entry<UUID, List<CartItemDto>> entry : itemsByShop.entrySet()) {
            UUID shopId = entry.getKey();
            List<CartItemDto> shopItems = entry.getValue();

            BigDecimal shopSubtotal = BigDecimal.ZERO;
            String shopName = shopItems.isEmpty() ? "Unknown Shop" : shopItems.get(0).getShopName();
            int toDistrictId = 1442;
            String toWardCode = "20109";
            if (request.getShippingAddressId() != null) {
                var addressOpt = userAddressRepository.findById(request.getShippingAddressId());
                if (addressOpt.isPresent()) {
                    var address = addressOpt.get();
                    if (address.getGhnDistrictId() != null) toDistrictId = address.getGhnDistrictId();
                    if (address.getGhnWardCode() != null) toWardCode = address.getGhnWardCode();
                }
            }
            int fromDistrictId = 1442; // Fallback shop district
            String fromWardCode = "20109"; // Fallback shop ward
            var shopOpt = shopRepository.findById(shopId);
            if (shopOpt.isPresent()) {
                var shop = shopOpt.get();
                if (shop.getWarehouseDistrictId() != null) fromDistrictId = shop.getWarehouseDistrictId();
                if (shop.getWarehouseWardCode() != null) fromWardCode = shop.getWarehouseWardCode();
            }
            long shippingFee = ghnShippingClient.calculateFee(fromDistrictId, fromWardCode, toDistrictId, toWardCode, 500, 20, 15, 5);
            ChildOrderJpaEntity childOrder = ChildOrderJpaEntity.builder()
                    .parentOrder(parentOrder)
                    .shopId(shopId)
                    .shopName(shopName)
                    .status("PENDING")
                    // Note: Cần thêm logic tìm shopVoucherId nếu req gửi lên list
                    // và apply shipping_fee 
                    .shippingFee(BigDecimal.valueOf(shippingFee)) // Gọi GHN tính phí
                    .build();

            for (CartItemDto item : shopItems) {
                // Giảm tồn kho (Optimistic Lock)
                ProductSkuJpaEntity sku = productSkuRepository.findById(item.getSkuId())
                        .orElseThrow(() -> new RuntimeException("SKU not found"));
                
                if (sku.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Not enough stock for SKU: " + sku.getSkuCode());
                }
                
                // Trừ tồn kho (Hibernate sẽ check @Version lúc flush)
                sku.setStockQuantity(sku.getStockQuantity() - item.getQuantity());
                productSkuRepository.save(sku);

                BigDecimal itemTotal = sku.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                shopSubtotal = shopSubtotal.add(itemTotal);

                OrderItemJpaEntity orderItem = OrderItemJpaEntity.builder()
                        .childOrder(childOrder)
                        .productId(item.getProductId())
                        .skuId(item.getSkuId())
                        .productName(item.getProductName())
                        .imageUrl(item.getImageUrl())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(sku.getPrice())
                        .build();

                childOrder.getItems().add(orderItem);
            }

            childOrder.setSubtotal(shopSubtotal);
            childOrder.setTotalAmount(shopSubtotal.add(childOrder.getShippingFee()).subtract(childOrder.getShopDiscount()));
            
            parentOrder.getChildOrders().add(childOrder);
            grandTotal = grandTotal.add(childOrder.getTotalAmount());
        }

        // Apply Platform voucher discount logic here
        BigDecimal platformDiscount = BigDecimal.ZERO;
        if (request.getPlatformVoucherId() != null) {
            VoucherJpaEntity voucher = voucherRepository.findById(request.getPlatformVoucherId())
                    .orElse(null);
            
            if (voucher != null && voucher.getActive() && voucher.getExpiryDate().isAfter(java.time.ZonedDateTime.now())) {
                if (grandTotal.compareTo(voucher.getMinOrderValue()) >= 0) {
                    BigDecimal calculatedDiscount = grandTotal.multiply(voucher.getDiscountPercent()).divide(BigDecimal.valueOf(100));
                    if (voucher.getMaxDiscountAmount() != null && calculatedDiscount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                        calculatedDiscount = voucher.getMaxDiscountAmount();
                    }
                    platformDiscount = calculatedDiscount;
                }
            }
        }

        parentOrder.setPlatformDiscount(platformDiscount);
        parentOrder.setTotalAmount(grandTotal);
        parentOrder.setFinalAmount(grandTotal.subtract(platformDiscount));

        // Lưu toàn bộ tree: Parent -> Child -> Items
        parentOrder = parentOrderRepository.save(parentOrder);

        // 4. Xóa các item đã mua khỏi Redis Cart
        for (UUID skuId : request.getSkuIds()) {
            cartService.removeFromCart(userId, skuId);
        }

        // 5. Publish Event cho các hệ thống khác (Payment)
        eventPublisher.publishEvent(new OrderPlacedEvent(parentOrder.getId(), userId, parentOrder.getFinalAmount()));

        log.info("Checkout successful for user {}, ParentOrder ID: {}", userId, parentOrder.getId());
        
        return CheckoutResponse.builder()
                .parentOrderId(parentOrder.getId())
                .totalAmount(parentOrder.getTotalAmount())
                .finalAmount(parentOrder.getFinalAmount())
                .status(parentOrder.getStatus())
                .build();
    }

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
}
