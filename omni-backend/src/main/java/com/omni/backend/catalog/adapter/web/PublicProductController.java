package com.omni.backend.catalog.adapter.web;

import com.omni.backend.catalog.adapter.elasticsearch.ProductDocument;
import com.omni.backend.catalog.application.service.ProductSearchService;
import com.omni.backend.catalog.application.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductSearchService productSearchService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDocument>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<UUID> categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String shopLocation,
            @RequestParam(required = false) UUID shopId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ProductDocument> results = productSearchService.searchProducts(keyword, categoryId, minPrice, maxPrice, minRating, shopLocation, shopId, sortBy, page, size);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDocument>> getFeaturedProducts(
            @RequestParam(defaultValue = "bestseller") String tab) {
        return ResponseEntity.ok(productService.getFeaturedProducts(tab));
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.omni.backend.catalog.application.dto.ProductDto> getProductById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<ProductDocument>> getRecommendations(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getRecommendations(id));
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/view")
    public ResponseEntity<Void> trackView(@PathVariable UUID id) {
        productService.trackView(id);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.PostMapping("/{id}/track-cart")
    public ResponseEntity<Void> trackCart(@PathVariable UUID id) {
        productService.trackCart(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shops/{shopId}")
    public ResponseEntity<Page<ProductDocument>> getProductsByShopId(
            @PathVariable UUID shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.getPublicProductsByShopId(shopId, page, size));
    }
}
