package com.omni.backend.catalog.adapter.web;

import com.omni.backend.catalog.application.dto.ProductDto;
import com.omni.backend.catalog.application.service.ProductService;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ShopRepository shopRepository;

    private UUID getShopIdForCurrentUser(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        ShopJpaEntity shop = shopRepository.findByOwnerId(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn chưa đăng ký Shop hoặc Shop chưa được duyệt"));
        
        if (!"ACTIVE".equals(shop.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Shop của bạn chưa được duyệt hoặc đang bị khóa");
        }
        return shop.getId();
    }

    private void validateProductOwnership(UUID productId, UUID shopId) {
        ProductDto product = productService.getProductById(productId);
        if (!product.getShopId().equals(shopId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên sản phẩm này");
        }
    }

    @GetMapping
    public ResponseEntity<Page<ProductDto>> getMyProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        Page<ProductDto> products = productService.getProductsByShopId(shopId, page, size);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(Authentication authentication, @RequestBody ProductDto request) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        request.setShopId(shopId); // Force shopId to be the vendor's shop
        
        ProductDto created = productService.createProduct(request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(Authentication authentication, @PathVariable UUID id, @RequestBody ProductDto request) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        validateProductOwnership(id, shopId);
        
        request.setShopId(shopId); // Ensure they can't change the shopId
        ProductDto updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateProductStatus(Authentication authentication, @PathVariable UUID id, @RequestParam String status) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        validateProductOwnership(id, shopId);
        
        productService.updateProductStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(Authentication authentication, @PathVariable UUID id) {
        UUID shopId = getShopIdForCurrentUser(authentication);
        validateProductOwnership(id, shopId);
        
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
