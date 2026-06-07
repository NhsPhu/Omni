package com.omni.backend.sales.application.service;

import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.elasticsearch.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockReservationService {

    private final ProductSkuRepository productSkuRepository;
    private final ProductRepository productRepository;
    private final ProductSearchRepository productSearchRepository;

    public void reserveStockAndIncrementSold(UUID skuId, UUID productId, int quantity, String skuCode) {
        int updatedRows = productSkuRepository.deductStock(skuId, quantity);
        if (updatedRows == 0) {
            throw new RuntimeException("Not enough stock for SKU: " + skuCode);
        }

        productRepository.incrementSoldCount(productId, quantity);

        productSearchRepository.findById(productId).ifPresent(doc -> {
            doc.setSoldCount(doc.getSoldCount() + quantity);
            productSearchRepository.save(doc);
        });
    }
}
