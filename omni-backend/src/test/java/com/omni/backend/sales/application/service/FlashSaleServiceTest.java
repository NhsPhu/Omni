package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductImageRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.sales.adapter.persistence.entity.FlashSaleEventJpaEntity;
import com.omni.backend.sales.adapter.persistence.entity.FlashSaleItemJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.FlashSaleEventRepository;
import com.omni.backend.sales.adapter.persistence.repository.FlashSaleItemRepository;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import com.omni.backend.sales.application.dto.FlashSaleEventDto;
import com.omni.backend.sales.application.dto.FlashSaleItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlashSaleServiceTest {

    @Mock
    private FlashSaleEventRepository eventRepository;

    @Mock
    private FlashSaleItemRepository itemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private ParentOrderRepository parentOrderRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @InjectMocks
    private FlashSaleService flashSaleService;

    private final UUID testEventId = UUID.randomUUID();
    private final UUID testItemId = UUID.randomUUID();
    private final UUID testSkuId = UUID.randomUUID();
    private final UUID testShopId = UUID.randomUUID();
    private final UUID testProductId = UUID.randomUUID();
    
    private FlashSaleEventJpaEntity testEvent;
    private FlashSaleItemJpaEntity testItem;

    @BeforeEach
    void setUp() {
        testEvent = new FlashSaleEventJpaEntity();
        testEvent.setId(testEventId);
        testEvent.setTitle("Test Event");
        testEvent.setStartTime(ZonedDateTime.now().plusDays(1));
        testEvent.setEndTime(ZonedDateTime.now().plusDays(2));
        testEvent.setStatus("UPCOMING");
        testEvent.setMaxItems(50);

        testItem = new FlashSaleItemJpaEntity();
        testItem.setId(testItemId);
        testItem.setEventId(testEventId);
        testItem.setProductId(testProductId);
        testItem.setSkuId(testSkuId);
        testItem.setShopId(testShopId);
        testItem.setFlashPrice(new BigDecimal("100000"));
        testItem.setFlashStock(10);
        testItem.setStatus("PENDING");
    }

    @Test
    void testCreateEvent() {
        FlashSaleEventDto dto = new FlashSaleEventDto();
        dto.setTitle("New Event");

        when(eventRepository.save(any(FlashSaleEventJpaEntity.class))).thenAnswer(i -> {
            FlashSaleEventJpaEntity e = i.getArgument(0);
            e.setId(testEventId);
            return e;
        });

        FlashSaleEventDto result = flashSaleService.createEvent(dto);

        assertNotNull(result.getId());
        assertEquals("New Event", result.getTitle());
        verify(eventRepository).save(any(FlashSaleEventJpaEntity.class));
    }

    @Test
    void testApproveItem() {
        when(itemRepository.findById(testItemId)).thenReturn(Optional.of(testItem));

        flashSaleService.approveItem(testItemId);

        assertEquals("APPROVED", testItem.getStatus());
        verify(itemRepository).save(testItem);
    }

    @Test
    void testRegisterProduct_Success() {
        FlashSaleItemDto dto = new FlashSaleItemDto();
        dto.setProductId(testProductId);
        dto.setSkuId(testSkuId);
        dto.setFlashPrice(new BigDecimal("90000"));
        dto.setFlashStock(5);

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setPrice(new BigDecimal("120000"));
        sku.setStockQuantity(10);

        when(eventRepository.findById(testEventId)).thenReturn(Optional.of(testEvent));
        when(itemRepository.findByEventIdAndProductIdAndSkuId(testEventId, testProductId, testSkuId)).thenReturn(Optional.empty());
        when(itemRepository.countByEventId(testEventId)).thenReturn(10L);
        when(productSkuRepository.findById(testSkuId)).thenReturn(Optional.of(sku));
        when(itemRepository.save(any(FlashSaleItemJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        FlashSaleItemDto result = flashSaleService.registerProduct(testEventId, dto, testShopId);

        assertNotNull(result);
        assertEquals(new BigDecimal("90000"), result.getFlashPrice());
        verify(itemRepository).save(any(FlashSaleItemJpaEntity.class));
    }

    @Test
    void testRegisterProduct_EventEnded() {
        testEvent.setStatus("ENDED");
        when(eventRepository.findById(testEventId)).thenReturn(Optional.of(testEvent));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            flashSaleService.registerProduct(testEventId, new FlashSaleItemDto(), testShopId)
        );

        assertEquals("Flash Sale đã kết thúc, không thể đăng ký", exception.getMessage());
    }

    @Test
    void testRegisterProduct_InvalidPrice() {
        FlashSaleItemDto dto = new FlashSaleItemDto();
        dto.setProductId(testProductId);
        dto.setSkuId(testSkuId);
        dto.setFlashPrice(new BigDecimal("150000")); // Higher than original

        ProductSkuJpaEntity sku = new ProductSkuJpaEntity();
        sku.setPrice(new BigDecimal("120000"));

        when(eventRepository.findById(testEventId)).thenReturn(Optional.of(testEvent));
        when(productSkuRepository.findById(testSkuId)).thenReturn(Optional.of(sku));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            flashSaleService.registerProduct(testEventId, dto, testShopId)
        );

        assertEquals("Giá Flash Sale phải thấp hơn giá gốc", exception.getMessage());
    }

    @Test
    void testRecordFlashSalePurchase_Success() {
        testEvent.setStatus("ACTIVE");
        testItem.setStatus("APPROVED");

        when(eventRepository.findFirstByStatusOrderByStartTimeAsc("ACTIVE")).thenReturn(Optional.of(testEvent));
        when(itemRepository.findByEventIdAndStatus(testEventId, "APPROVED")).thenReturn(List.of(testItem));
        
        when(redisTemplate.execute(any(RedisScript.class), anyList(), anyString(), anyString())).thenReturn(1L);

        boolean result = flashSaleService.recordFlashSalePurchase(UUID.randomUUID(), testSkuId, 1);

        assertTrue(result);
        assertEquals(1, testItem.getSoldCount());
        verify(itemRepository).save(testItem);
    }
}
