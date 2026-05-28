package com.omni.backend.catalog.application.service;

import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import com.omni.backend.catalog.adapter.elasticsearch.ProductSearchRepository;
import com.omni.backend.catalog.adapter.persistence.entity.CategoryJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductImageJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductJpaEntity;
import com.omni.backend.catalog.adapter.persistence.entity.ProductSkuJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.CategoryRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductImageRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductRepository;
import com.omni.backend.catalog.adapter.persistence.repository.ProductSkuRepository;
import com.omni.backend.catalog.application.dto.ProductDto;
import com.omni.backend.catalog.application.dto.ProductImageDto;
import com.omni.backend.catalog.application.dto.ProductSkuDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final ProductSearchRepository productSearchRepository;

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        ProductJpaEntity product = ProductJpaEntity.builder()
                .shopId(dto.getShopId())
                .categoryId(dto.getCategoryId())
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .avgRating(BigDecimal.ZERO)
                .reviewCount(0)
                .build();
        product = productRepository.save(product);

        saveSkusAndImages(product.getId(), dto);
        indexProductInElasticsearch(product);

        dto.setId(product.getId());
        return dto;
    }

    @Transactional
    public ProductDto updateProduct(UUID id, ProductDto dto) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setCategoryId(dto.getCategoryId());
        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product = productRepository.save(product);

        // Replace SKUs and Images (Simple approach for now)
        productSkuRepository.deleteAll(productSkuRepository.findByProductId(id));
        productImageRepository.deleteByProductId(id);

        saveSkusAndImages(id, dto);
        indexProductInElasticsearch(product);

        dto.setId(id);
        return dto;
    }

    @Transactional
    public void updateProductStatus(UUID id, String status) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(status);
        productRepository.save(product);
        // Note: You could also sync status to ES if it's used for filtering
    }

    @Transactional
    public void deleteProduct(UUID id) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setDeletedAt(ZonedDateTime.now());
        productRepository.save(product);
        productSearchRepository.deleteById(id); // Remove from ES on soft delete
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(UUID id) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<ProductSkuDto> skus = productSkuRepository.findByProductId(id).stream()
                .map(sku -> ProductSkuDto.builder()
                        .id(sku.getId())
                        .skuCode(sku.getSkuCode())
                        .price(sku.getPrice())
                        .stockQuantity(sku.getStockQuantity())
                        .attributes(sku.getAttributes())
                        .build())
                .collect(Collectors.toList());

        List<ProductImageDto> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id).stream()
                .map(img -> ProductImageDto.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .isPrimary(img.getIsPrimary())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());

        return ProductDto.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .status(product.getStatus())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .skus(skus)
                .images(images)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByShopId(UUID shopId, int page, int size) {
        return productRepository.findByShopId(shopId, PageRequest.of(page, size))
                .map(product -> ProductDto.builder()
                        .id(product.getId())
                        .shopId(product.getShopId())
                        .categoryId(product.getCategoryId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .status(product.getStatus())
                        .build()); // Return lightweight DTO for list view
    }

    @Transactional(readOnly = true)
    public List<ProductDocument> getFeaturedProducts(String tab) {
        PageRequest top8 = PageRequest.of(0, 8);
        List<ProductJpaEntity> entities;
        
        if ("new".equalsIgnoreCase(tab)) {
            entities = productRepository.findNewestProducts(top8);
        } else if ("sale".equalsIgnoreCase(tab)) {
            entities = productRepository.findCheapestProducts(top8);
        } else { // bestseller or default
            entities = productRepository.findBestSellerProducts(top8);
        }

        return entities.stream().map(this::mapToDocument).collect(Collectors.toList());
    }

    private ProductDocument mapToDocument(ProductJpaEntity product) {
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(CategoryJpaEntity::getName).orElse("Unknown");
        List<ProductSkuJpaEntity> skus = productSkuRepository.findByProductId(product.getId());
        BigDecimal minPrice = skus.stream().map(ProductSkuJpaEntity::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal maxPrice = skus.stream().map(ProductSkuJpaEntity::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        return ProductDocument.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .description(product.getDescription())
                .priceMin(minPrice)
                .priceMax(maxPrice)
                .avgRating(product.getAvgRating())
                .categoryName(categoryName)
                .shopName("Omni Shop") // Hardcoded or fetch shop
                .build();
    }

    private void saveSkusAndImages(UUID productId, ProductDto dto) {
        if (dto.getSkus() != null) {
            List<ProductSkuJpaEntity> skus = dto.getSkus().stream().map(skuDto ->
                    ProductSkuJpaEntity.builder()
                            .productId(productId)
                            .skuCode(skuDto.getSkuCode())
                            .price(skuDto.getPrice())
                            .stockQuantity(skuDto.getStockQuantity())
                            .attributes(skuDto.getAttributes() != null ? skuDto.getAttributes() : Map.of())
                            .build()
            ).collect(Collectors.toList());
            productSkuRepository.saveAll(skus);
        }

        if (dto.getImages() != null) {
            List<ProductImageJpaEntity> images = dto.getImages().stream().map(imgDto ->
                    ProductImageJpaEntity.builder()
                            .productId(productId)
                            .imageUrl(imgDto.getImageUrl())
                            .isPrimary(imgDto.getIsPrimary() != null ? imgDto.getIsPrimary() : false)
                            .sortOrder(imgDto.getSortOrder())
                            .build()
            ).collect(Collectors.toList());
            productImageRepository.saveAll(images);
        }
    }

    private void indexProductInElasticsearch(ProductJpaEntity product) {
        String categoryName = categoryRepository.findById(product.getCategoryId())
                .map(CategoryJpaEntity::getName)
                .orElse("Unknown");

        List<ProductSkuJpaEntity> skus = productSkuRepository.findByProductId(product.getId());
        BigDecimal minPrice = skus.stream().map(ProductSkuJpaEntity::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal maxPrice = skus.stream().map(ProductSkuJpaEntity::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        ProductDocument doc = ProductDocument.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .description(product.getDescription())
                .priceMin(minPrice)
                .priceMax(maxPrice)
                .avgRating(product.getAvgRating())
                .categoryName(categoryName)
                .shopName("Shop Name") // Should fetch from Shop if available
                .build();

        productSearchRepository.save(doc);
    }
}
