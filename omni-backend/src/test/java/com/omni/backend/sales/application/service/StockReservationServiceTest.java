package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import com.omni.backend.catalog.adapter.elasticsearch.ProductSearchRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockReservationServiceTest {

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSearchRepository productSearchRepository;

    @InjectMocks
    private StockReservationService stockReservationService;

    private final UUID testSkuId = UUID.randomUUID();
    private final UUID testProductId = UUID.randomUUID();
    private final String testSkuCode = "TEST-SKU-01";

    @Test
    void testReserveStockAndIncrementSold_Success() {
        int quantity = 2;
        when(productSkuRepository.deductStock(testSkuId, quantity)).thenReturn(1);

        ProductDocument doc = new ProductDocument();
        doc.setId(testProductId);
        doc.setSoldCount(10);
        when(productSearchRepository.findById(testProductId)).thenReturn(Optional.of(doc));

        stockReservationService.reserveStockAndIncrementSold(testSkuId, testProductId, quantity, testSkuCode);

        verify(productSkuRepository).deductStock(testSkuId, quantity);
        verify(productRepository).incrementSoldCount(testProductId, quantity);
        verify(productSearchRepository).save(any(ProductDocument.class));
        assertEquals(12, doc.getSoldCount());
    }

    @Test
    void testReserveStockAndIncrementSold_NotEnoughStock() {
        int quantity = 100;
        when(productSkuRepository.deductStock(testSkuId, quantity)).thenReturn(0);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> 
            stockReservationService.reserveStockAndIncrementSold(testSkuId, testProductId, quantity, testSkuCode)
        );

        assertEquals("Not enough stock for SKU: " + testSkuCode, exception.getMessage());
        
        // Ensure no other operations were called
        verify(productRepository, never()).incrementSoldCount(any(), anyInt());
        verify(productSearchRepository, never()).findById(any());
    }
}
