package com.omni.backend.catalog.application.service;

import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchHitsImpl;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.Query;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductSearchServiceTest {

    @Mock
    private ElasticsearchOperations elasticsearchOperations;

    @Mock
    private com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository categoryRepository;

    @InjectMocks
    private ProductSearchService productSearchService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testSearchProducts_WithAllFilters() {
        String keyword = "iphone";
        List<UUID> categoryIds = Collections.singletonList(UUID.randomUUID());
        Double minPrice = 100000.0;
        Double maxPrice = 500000.0;
        Double minRating = 4.0;
        String location = "Hanoi";
        String sortBy = "price_asc";
        int page = 0;
        int size = 10;

        SearchHits<ProductDocument> mockSearchHits = mock(SearchHits.class);
        when(mockSearchHits.getSearchHits()).thenReturn(Collections.emptyList());
        when(mockSearchHits.getTotalHits()).thenReturn(0L);

        when(elasticsearchOperations.search(any(Query.class), eq(ProductDocument.class)))
                .thenReturn(mockSearchHits);

        Page<ProductDocument> result = productSearchService.searchProducts(
                keyword, categoryIds, minPrice, maxPrice, minRating, location, null, sortBy, page, size);

        assertNotNull(result);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(elasticsearchOperations).search(queryCaptor.capture(), eq(ProductDocument.class));

        Query capturedQuery = queryCaptor.getValue();
        assertNotNull(capturedQuery);
    }

    @Test
    void testSearchProducts_NoFilters() {
        int page = 0;
        int size = 10;

        SearchHits<ProductDocument> mockSearchHits = mock(SearchHits.class);
        when(mockSearchHits.getSearchHits()).thenReturn(Collections.emptyList());
        when(mockSearchHits.getTotalHits()).thenReturn(0L);

        when(elasticsearchOperations.search(any(Query.class), eq(ProductDocument.class)))
                .thenReturn(mockSearchHits);

        Page<ProductDocument> result = productSearchService.searchProducts(
                null, null, null, null, null, null, null, null, page, size);

        assertNotNull(result);

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(elasticsearchOperations).search(queryCaptor.capture(), eq(ProductDocument.class));

        Query capturedQuery = queryCaptor.getValue();
        assertNotNull(capturedQuery);
    }
}
