package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserAddressJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserAddressRepository;
import com.omni.backend.notification.application.service.NotificationService;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.OrderItemJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.OrderStatusHistoryJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import com.omni.backend.sales.adapter.persistence.repository.OrderStatusHistoryRepository;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.shipping.application.service.GhnShippingClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private ParentOrderRepository parentOrderRepository;

    @Mock
    private ChildOrderRepository childOrderRepository;

    @Mock
    private OrderStatusHistoryRepository historyRepository;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private GhnShippingClient ghnShippingClient;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserAddressRepository userAddressRepository;

    @InjectMocks
    private OrderService orderService;

    private final UUID testUserId = UUID.randomUUID();
    private final UUID testShopId = UUID.randomUUID();
    private final UUID parentOrderId = UUID.randomUUID();
    private final UUID childOrderId = UUID.randomUUID();

    private ParentOrderJpaEntity parentOrder;
    private ChildOrderJpaEntity childOrder;

    @BeforeEach
    void setUp() {
        parentOrder = new ParentOrderJpaEntity();
        parentOrder.setId(parentOrderId);
        parentOrder.setUserId(testUserId);
        parentOrder.setStatus("PENDING");
        parentOrder.setChildOrders(new java.util.HashSet<>());

        childOrder = new ChildOrderJpaEntity();
        childOrder.setId(childOrderId);
        childOrder.setParentOrder(parentOrder);
        childOrder.setShopId(testShopId);
        childOrder.setStatus("PENDING");
        childOrder.setTotalAmount(new BigDecimal("100000"));
        childOrder.setItems(new java.util.HashSet<>());
        
        parentOrder.getChildOrders().add(childOrder);
    }

    @Test
    void testCancelUserOrder_Success() {
        UUID skuId = UUID.randomUUID();
        OrderItemJpaEntity item = new OrderItemJpaEntity();
        item.setSkuId(skuId);
        item.setQuantity(2);
        childOrder.getItems().add(item);

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setId(skuId);
        sku.setStockQuantity(10);

        when(parentOrderRepository.findById(parentOrderId)).thenReturn(Optional.of(parentOrder));
        when(productSkuRepository.findById(skuId)).thenReturn(Optional.of(sku));

        orderService.cancelUserOrder(testUserId, parentOrderId);

        assertEquals("CANCELLED", parentOrder.getStatus());
        assertEquals("CANCELLED", childOrder.getStatus());
        assertEquals(12, sku.getStockQuantity()); // Stock rolled back

        verify(parentOrderRepository).save(parentOrder);
        verify(historyRepository).save(any(OrderStatusHistoryJpaEntity.class));
        verify(productSkuRepository).save(sku);
    }

    @Test
    void testCancelUserOrder_Unauthorized() {
        when(parentOrderRepository.findById(parentOrderId)).thenReturn(Optional.of(parentOrder));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            orderService.cancelUserOrder(UUID.randomUUID(), parentOrderId)
        );

        assertEquals("Unauthorized", exception.getMessage());
    }

    @Test
    void testUpdateVendorOrderStatus_Success() {
        when(childOrderRepository.findById(childOrderId)).thenReturn(Optional.of(childOrder));

        orderService.updateVendorOrderStatus(testShopId, childOrderId, "PROCESSING", testUserId);

        assertEquals("PROCESSING", childOrder.getStatus());
        verify(historyRepository).save(any(OrderStatusHistoryJpaEntity.class));
        verify(childOrderRepository).save(childOrder);
    }

    @Test
    void testUpdateVendorOrderStatus_InvalidTransition() {
        when(childOrderRepository.findById(childOrderId)).thenReturn(Optional.of(childOrder));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
            orderService.updateVendorOrderStatus(testShopId, childOrderId, "DELIVERED", testUserId)
        );

        assertTrue(exception.getMessage().contains("Invalid order status transition"));
    }

    @Test
    void testShipVendorOrder_Success() {
        childOrder.setStatus("PROCESSING");
        
        UserAddressJpaEntity address = new UserAddressJpaEntity();
        address.setDetail("123 Street");
        address.setWard("Ward 1");
        address.setDistrict("District 1");
        address.setReceiverName("John");
        address.setReceiverPhone("0123456789");
        address.setGhnDistrictId(1442);
        address.setGhnWardCode("20107");

        parentOrder.setShippingAddressId(UUID.randomUUID());

        when(childOrderRepository.findById(childOrderId)).thenReturn(Optional.of(childOrder));
        when(userAddressRepository.findById(parentOrder.getShippingAddressId())).thenReturn(Optional.of(address));
        when(ghnShippingClient.createOrder(anyString(), anyString(), anyString(), anyString(), anyInt(), anyInt(), anyInt(), anyInt(), anyInt(), anyLong())).thenReturn("GHN-123456");
        when(childOrderRepository.save(any(ChildOrderJpaEntity.class))).thenReturn(childOrder);

        ChildOrderJpaEntity result = orderService.shipVendorOrder(testShopId, childOrderId, testUserId);

        assertEquals("SHIPPED", result.getStatus());
        assertEquals("GHN-123456", result.getTrackingCode());
        assertNotNull(result.getShippedAt());

        verify(ghnShippingClient).createOrder(eq("John"), eq("0123456789"), eq("123 Street, Ward 1, District 1"), eq("20107"), eq(1442), eq(500), eq(20), eq(15), eq(5), eq(100000L));
        verify(historyRepository).save(any(OrderStatusHistoryJpaEntity.class));
        verify(notificationService).sendSystemNotification(eq(testUserId), anyString(), anyString(), anyString());
    }

    @Test
    void testShipVendorOrder_WrongStatus() {
        childOrder.setStatus("PENDING");

        when(childOrderRepository.findById(childOrderId)).thenReturn(Optional.of(childOrder));

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
            orderService.shipVendorOrder(testShopId, childOrderId, testUserId)
        );

        assertEquals("Order must be in PROCESSING status to be shipped", exception.getMessage());
    }
}
