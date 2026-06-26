package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.catalog.adapter.elasticsearch.ProductSearchRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StockReservationService Tests")
class StockReservationServiceTest {

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSearchRepository productSearchRepository;

    @InjectMocks
    private StockReservationService stockReservationService;

    private final UUID skuId = UUID.randomUUID();
    private final UUID productId = UUID.randomUUID();

    @Nested
    @DisplayName("reserveStockAndIncrementSold() - Trừ tồn kho và tăng sold count")
    class ReserveStockTests {

        @Test
        @DisplayName("✅ Trừ tồn kho và tăng sold count thành công")
        void reserveStock_Success() {
            when(productSkuRepository.deductStock(skuId, 2)).thenReturn(1);
            when(productSearchRepository.findById(productId)).thenReturn(Optional.empty());

            assertDoesNotThrow(() ->
                    stockReservationService.reserveStockAndIncrementSold(skuId, productId, 2, "SKU-001"));

            verify(productSkuRepository).deductStock(skuId, 2);
            verify(productRepository).incrementSoldCount(productId, 2);
        }

        @Test
        @DisplayName("❌ Lỗi khi không đủ tồn kho (deductStock trả về 0)")
        void reserveStock_OutOfStock_ThrowsException() {
            when(productSkuRepository.deductStock(skuId, 5)).thenReturn(0);

            RuntimeException ex = assertThrows(RuntimeException.class, () ->
                    stockReservationService.reserveStockAndIncrementSold(skuId, productId, 5, "SKU-SPECIAL"));

            assertTrue(ex.getMessage().contains("SKU-SPECIAL"));
            verify(productRepository, never()).incrementSoldCount(any(), anyInt());
        }

        @Test
        @DisplayName("✅ Cũng cập nhật Elasticsearch khi tài liệu tồn tại")
        void reserveStock_UpdatesElasticsearch_WhenDocumentExists() {
            com.omni.backend.catalog.adapter.elasticsearch.ProductDocument doc =
                    new com.omni.backend.catalog.adapter.elasticsearch.ProductDocument();
            doc.setId(productId);
            doc.setSoldCount(10);

            when(productSkuRepository.deductStock(skuId, 3)).thenReturn(1);
            when(productSearchRepository.findById(productId)).thenReturn(Optional.of(doc));
            when(productSearchRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            stockReservationService.reserveStockAndIncrementSold(skuId, productId, 3, "SKU-002");

            assertEquals(13, doc.getSoldCount());
            verify(productSearchRepository).save(doc);
        }
    }
}
