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
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.catalog.application.dto.ProductDto;
import com.omni.backend.catalog.application.dto.ProductImageDto;
import com.omni.backend.catalog.application.dto.ProductSkuDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.omni.backend.shared.security.SecurityUtils;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final ProductSearchRepository productSearchRepository;
    private final ShopRepository shopRepository;

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        String slug = dto.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = dto.getName().toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "-") + "-" + System.currentTimeMillis();
        }

        ProductJpaEntity product = ProductJpaEntity.builder()
                .shopId(dto.getShopId())
                .categoryId(dto.getCategoryId())
                .name(dto.getName())
                .slug(slug)
                .description(dto.getDescription())
                .videoUrl(dto.getVideoUrl())
                .specs(dto.getSpecs())
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

        UUID currentShopId = SecurityUtils.getCurrentShopId();
        if (currentShopId == null || !product.getShopId().equals(currentShopId)) {
            throw new AccessDeniedException("You do not own this product");
        }

        product.setCategoryId(dto.getCategoryId());
        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setDescription(dto.getDescription());
        product.setVideoUrl(dto.getVideoUrl());
        product.setSpecs(dto.getSpecs());
        product = productRepository.save(product);

        // Delete physical images before updating
        List<ProductImageJpaEntity> oldImages = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        for (ProductImageJpaEntity img : oldImages) {
            try {
                String url = img.getImageUrl();
                if (url != null && url.startsWith("/uploads/")) {
                    String fileName = url.substring("/uploads/".length());
                    java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", fileName);
                    java.nio.file.Files.deleteIfExists(filePath);
                }
            } catch (Exception e) {
                log.warn("Failed to delete image from storage: {}", img.getImageUrl(), e);
            }
        }

        // Replace Images
        productImageRepository.deleteByProductId(id);

        // Merge SKUs instead of deleting to avoid foreign key violations with order_items
        List<ProductSkuJpaEntity> existingSkus = new java.util.ArrayList<>(productSkuRepository.findByProductId(id));
        
        if (dto.getSkus() != null && !dto.getSkus().isEmpty()) {
            for (ProductSkuDto skuDto : dto.getSkus()) {
                ProductSkuJpaEntity existing = existingSkus.stream()
                        .filter(s -> (s.getSkuCode() != null && s.getSkuCode().equals(skuDto.getSkuCode())) || 
                                     (s.getAttributes() != null && s.getAttributes().equals(skuDto.getAttributes())))
                        .findFirst()
                        .orElse(null);
                        
                if (existing != null) {
                    existing.setPrice(skuDto.getPrice());
                    existing.setOriginalPrice(skuDto.getOriginalPrice());
                    existing.setStockQuantity(skuDto.getStockQuantity());
                    existing.setSkuCode(skuDto.getSkuCode()); // update sku code if it changed but attributes matched
                    productSkuRepository.save(existing);
                    existingSkus.remove(existing); // remove from list to track which ones are left
                } else {
                    ProductSkuJpaEntity newSku = ProductSkuJpaEntity.builder()
                            .productId(id)
                            .skuCode(skuDto.getSkuCode() != null && !skuDto.getSkuCode().isEmpty() ? skuDto.getSkuCode() : "SKU-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                            .price(skuDto.getPrice())
                            .originalPrice(skuDto.getOriginalPrice())
                            .stockQuantity(skuDto.getStockQuantity())
                            .attributes(skuDto.getAttributes())
                            .build();
                    productSkuRepository.save(newSku);
                }
            }
        }
        
        // For remaining existing SKUs that are not in the new payload, set stock to 0 instead of deleting
        for (ProductSkuJpaEntity remaining : existingSkus) {
            remaining.setStockQuantity(0);
            productSkuRepository.save(remaining);
        }

        // Save Images
        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            List<ProductImageJpaEntity> imageEntities = dto.getImages().stream().map(img -> ProductImageJpaEntity.builder()
                    .productId(id)
                    .imageUrl(img.getImageUrl())
                    .isPrimary(img.getIsPrimary())
                    .sortOrder(img.getSortOrder())
                    .build()).collect(Collectors.toList());
            productImageRepository.saveAll(imageEntities);
        }
        indexProductInElasticsearch(product);

        dto.setId(id);
        return dto;
    }

    @Transactional
    public void updateProductStatus(UUID id, String status) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        UUID currentShopId = SecurityUtils.getCurrentShopId();
        if (currentShopId == null || !product.getShopId().equals(currentShopId)) {
            throw new AccessDeniedException("You do not own this product");
        }
        
        product.setStatus(status);
        productRepository.save(product);
        // Note: You could also sync status to ES if it's used for filtering
    }

    @Transactional
    public void deleteProduct(UUID id) {
        ProductJpaEntity product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        UUID currentShopId = SecurityUtils.getCurrentShopId();
        if (currentShopId == null || !product.getShopId().equals(currentShopId)) {
            throw new AccessDeniedException("You do not own this product");
        }
        // Delete physical images
        List<ProductImageJpaEntity> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        for (ProductImageJpaEntity img : images) {
            try {
                String url = img.getImageUrl();
                if (url != null && url.startsWith("/uploads/")) {
                    String fileName = url.substring("/uploads/".length());
                    java.nio.file.Path filePath = java.nio.file.Paths.get("uploads", fileName);
                    java.nio.file.Files.deleteIfExists(filePath);
                }
            } catch (Exception e) {
                log.warn("Failed to delete image from storage: {}", img.getImageUrl(), e);
            }
        }
        
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
                        .originalPrice(sku.getOriginalPrice())
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

        ShopJpaEntity shop = shopRepository.findById(product.getShopId()).orElse(null);
        String shopName = shop != null ? shop.getName() : "Unknown Shop";
        String shopLocation = shop != null && shop.getAddress() != null && !shop.getAddress().isEmpty() 
            ? shop.getAddress() : "TP. Hồ Chí Minh";

        return ProductDto.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .videoUrl(product.getVideoUrl())
                .specs(product.getSpecs())
                .status(product.getStatus())
                .shopName(shopName)
                .shopLocation(shopLocation)
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .soldCount(product.getSoldCount())
                .skus(skus)
                .images(images)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProductsByShopId(UUID shopId, int page, int size) {
        return productRepository.findByShopId(shopId, PageRequest.of(page, size))
                .map(product -> {
                    List<ProductSkuDto> skus = productSkuRepository.findByProductId(product.getId()).stream()
                            .map(sku -> ProductSkuDto.builder().price(sku.getPrice()).originalPrice(sku.getOriginalPrice()).stockQuantity(sku.getStockQuantity()).build())
                            .collect(Collectors.toList());
                    List<ProductImageDto> images = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId()).stream()
                            .map(img -> ProductImageDto.builder().imageUrl(img.getImageUrl()).build())
                            .collect(Collectors.toList());
                    return ProductDto.builder()
                        .id(product.getId())
                        .shopId(product.getShopId())
                        .categoryId(product.getCategoryId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .videoUrl(product.getVideoUrl())
                        .specs(product.getSpecs())
                        .status(product.getStatus())
                        .avgRating(product.getAvgRating())
                        .reviewCount(product.getReviewCount())
                        .soldCount(product.getSoldCount())
                        .skus(skus)
                        .images(images)
                        .build();
                });
    }

    @Transactional(readOnly = true)
    public Page<ProductDocument> getPublicProductsByShopId(UUID shopId, int page, int size) {
        return productRepository.findByShopId(shopId, PageRequest.of(page, size))
                .map(this::mapToDocument);
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
        BigDecimal maxPrice = skus.stream()
                .map(s -> s.getOriginalPrice() != null && s.getOriginalPrice().compareTo(s.getPrice()) > 0 ? s.getOriginalPrice() : s.getPrice())
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        String shopName = shopRepository.findById(product.getShopId())
                .map(ShopJpaEntity::getName).orElse("Unknown Shop");

        int totalStock = skus.stream().mapToInt(ProductSkuJpaEntity::getStockQuantity).sum();

        String imageUrl = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId()).stream()
                .findFirst().map(ProductImageJpaEntity::getImageUrl).orElse(null);

        return ProductDocument.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .description(product.getDescription())
                .priceMin(minPrice)
                .priceMax(maxPrice)
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount() != null ? product.getReviewCount() : 0)
                .soldCount(product.getSoldCount() != null ? product.getSoldCount() : 0)
                .stockQuantity(totalStock)
                .categoryName(categoryName)
                .shopName(shopName)
                .imageUrl(imageUrl)
                .build();
    }

    private void saveSkusAndImages(UUID productId, ProductDto dto) {
        if (dto.getSkus() != null) {
            List<ProductSkuJpaEntity> skus = dto.getSkus().stream().map(skuDto ->
                    ProductSkuJpaEntity.builder()
                            .productId(productId)
                            .skuCode(skuDto.getSkuCode())
                            .price(skuDto.getPrice())
                            .originalPrice(skuDto.getOriginalPrice())
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
        BigDecimal maxPrice = skus.stream()
                .map(s -> s.getOriginalPrice() != null && s.getOriginalPrice().compareTo(s.getPrice()) > 0 ? s.getOriginalPrice() : s.getPrice())
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        String shopName = shopRepository.findById(product.getShopId())
                .map(ShopJpaEntity::getName).orElse("Unknown Shop");

        int totalStock = skus.stream().mapToInt(ProductSkuJpaEntity::getStockQuantity).sum();

        String imageUrl = productImageRepository.findByProductIdOrderBySortOrderAsc(product.getId()).stream()
                .findFirst().map(ProductImageJpaEntity::getImageUrl).orElse(null);

        ProductDocument doc = ProductDocument.builder()
                .id(product.getId())
                .shopId(product.getShopId())
                .categoryId(product.getCategoryId())
                .name(product.getName())
                .description(product.getDescription())
                .priceMin(minPrice)
                .priceMax(maxPrice)
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount() != null ? product.getReviewCount() : 0)
                .soldCount(product.getSoldCount() != null ? product.getSoldCount() : 0)
                .stockQuantity(totalStock)
                .categoryName(categoryName)
                .shopName(shopName)
                .imageUrl(imageUrl)
                .build();

        productSearchRepository.save(doc);
    }

    @Transactional
    public void trackView(UUID productId) {
        productRepository.findById(productId).ifPresent(p -> {
            p.setViewsCount(p.getViewsCount() + 1);
            productRepository.save(p);
        });
    }

    @Transactional
    public void trackCart(UUID productId) {
        productRepository.findById(productId).ifPresent(p -> {
            p.setCartsCount(p.getCartsCount() + 1);
            productRepository.save(p);
        });
    }
}
