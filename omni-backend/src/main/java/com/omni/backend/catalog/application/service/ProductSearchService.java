package com.omni.backend.catalog.application.service;

import org.springframework.stereotype.Service;
import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHitSupport;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.SearchPage;
import co.elastic.clients.elasticsearch._types.query_dsl.QueryBuilders;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import org.springframework.data.elasticsearch.client.elc.NativeQueryBuilder;
import org.springframework.data.domain.Sort;
import org.springframework.data.elasticsearch.core.query.HighlightQuery;
import org.springframework.data.elasticsearch.core.query.highlight.Highlight;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightField;
import org.springframework.data.elasticsearch.core.query.highlight.HighlightFieldParameters;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository categoryRepository;

    public Page<ProductDocument> searchProducts(String keyword, java.util.List<UUID> categoryIds, Double minPrice, Double maxPrice, Double minRating, String shopLocation, String sortBy, int page, int size) {
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

        // 4. Filter by Rating
        if (minRating != null && minRating > 0) {
            boolQueryBuilder.filter(QueryBuilders.range().field("avgRating").gte(co.elastic.clients.json.JsonData.of(minRating)).build()._toQuery());
        }

        // 5. Filter by Location
        if (shopLocation != null && !shopLocation.isBlank()) {
            boolQueryBuilder.filter(QueryBuilders.term().field("shopLocation").value(shopLocation).build()._toQuery());
        }

        NativeQueryBuilder queryBuilder = NativeQuery.builder()
                .withQuery(boolQueryBuilder.build()._toQuery())
                .withPageable(PageRequest.of(page, size));

        // Add Highlighting
        HighlightFieldParameters parameters = HighlightFieldParameters.builder()
                .withPreTags("<span class=\"text-gold font-bold\">")
                .withPostTags("</span>")
                .build();
        queryBuilder.withHighlightQuery(new HighlightQuery(new Highlight(java.util.List.of(new HighlightField("name", parameters))), ProductDocument.class));

        // 6. Sorting
        if (sortBy != null && !sortBy.isBlank()) {
            switch (sortBy.toLowerCase()) {
                case "price_asc":
                    queryBuilder.withSort(Sort.by(Sort.Direction.ASC, "priceMin"));
                    break;
                case "price_desc":
                    queryBuilder.withSort(Sort.by(Sort.Direction.DESC, "priceMin"));
                    break;
                case "newest":
                    queryBuilder.withSort(Sort.by(Sort.Direction.DESC, "createdAt"));
                    break;
                case "topselling":
                    queryBuilder.withSort(Sort.by(Sort.Direction.DESC, "soldCount"));
                    break;
            }
        }

        NativeQuery nativeQuery = queryBuilder.build();

        SearchHits<ProductDocument> searchHits = elasticsearchOperations.search(nativeQuery, ProductDocument.class);
        
        java.util.List<ProductDocument> docs = searchHits.getSearchHits().stream().map(hit -> {
            ProductDocument doc = hit.getContent();
            if (hit.getHighlightField("name") != null && !hit.getHighlightField("name").isEmpty()) {
                doc.setName(hit.getHighlightField("name").get(0));
            }
            return doc;
        }).collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(docs, nativeQuery.getPageable(), searchHits.getTotalHits());
    }
}
