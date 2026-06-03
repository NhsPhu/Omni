package com.omni.backend.catalog.application.service;

import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHitSupport;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchPage;
import org.springframework.stereotype.Service;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository categoryRepository;

    public Page<ProductDocument> searchProducts(String keyword, java.util.List<UUID> categoryIds, Double minPrice, Double maxPrice, int page, int size) {
        BoolQuery.Builder boolQueryBuilder = QueryBuilders.bool();

        // 1. Full-text search on name and description
        if (keyword != null && !keyword.isBlank()) {
            boolQueryBuilder.must(QueryBuilders.multiMatch()
                    .fields("name^3", "description") // boost name x3
                    .query(keyword)
                    .build()._toQuery());
        } else {
            boolQueryBuilder.must(QueryBuilders.matchAll().build()._toQuery());
        }

        // 2. Filter by Categories (Include Children)
        if (categoryIds != null && !categoryIds.isEmpty()) {
            java.util.List<String> allCategoryIds = new java.util.ArrayList<>();
            
            for (UUID catId : categoryIds) {
                allCategoryIds.add(catId.toString());
                java.util.List<com.omni.backend.catalog.adapter.persistence.entity.CategoryJpaEntity> children = 
                    categoryRepository.findByParentIdOrderBySortOrderAsc(catId);
                if (children != null) {
                    children.forEach(c -> allCategoryIds.add(c.getId().toString()));
                }
            }

            BoolQuery.Builder categoryBoolQuery = QueryBuilders.bool();
            for (String id : allCategoryIds) {
                categoryBoolQuery.should(QueryBuilders.term().field("categoryId").value(id).build()._toQuery());
            }
            categoryBoolQuery.minimumShouldMatch("1");
            
            boolQueryBuilder.filter(categoryBoolQuery.build()._toQuery());
        }

        // 3. Filter by Price Range
        if (minPrice != null || maxPrice != null) {
            var rangeQuery = QueryBuilders.range().field("priceMin");
            if (minPrice != null) rangeQuery.gte(co.elastic.clients.json.JsonData.of(minPrice));
            if (maxPrice != null) rangeQuery.lte(co.elastic.clients.json.JsonData.of(maxPrice));
            boolQueryBuilder.filter(rangeQuery.build()._toQuery());
        }

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(boolQueryBuilder.build()._toQuery())
                .withPageable(PageRequest.of(page, size))
                .build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(nativeQuery, ProductDocument.class);
        SearchPage<ProductDocument> searchPage = SearchHitSupport.searchPageFor(searchHits, nativeQuery.getPageable());

        return (Page<ProductDocument>) SearchHitSupport.unwrapSearchHits(searchPage);
    }
}
