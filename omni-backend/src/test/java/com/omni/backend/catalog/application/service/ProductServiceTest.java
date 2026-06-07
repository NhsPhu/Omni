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
import com.omni.backend.catalog.application.dto.ProductSkuDto;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.shared.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductSearchRepository productSearchRepository;

    @Mock
    private ShopRepository shopRepository;

    @InjectMocks
    private ProductService productService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    private final UUID testShopId = UUID.randomUUID();
    private final UUID testProductId = UUID.randomUUID();
    private final UUID testCategoryId = UUID.randomUUID();
    
    private ProductJpaEntity testProduct;

    @BeforeEach
    void setUp() {
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        
        testProduct = ProductJpaEntity.builder()
                .id(testProductId)
                .shopId(testShopId)
                .categoryId(testCategoryId)
                .name("Test Product")
                .slug("test-product")
                .build();
    }

    @AfterEach
    void tearDown() {
        mockedSecurityUtils.close();
    }

    @Test
    void testCreateProduct_Success() {
        ProductDto dto = new ProductDto();
        dto.setShopId(testShopId);
        dto.setCategoryId(testCategoryId);
        dto.setName("New Product");
        
        ProductSkuDto sku = new ProductSkuDto();
        sku.setPrice(new BigDecimal("100000"));
        sku.setStockQuantity(10);
        dto.setSkus(List.of(sku));

        when(productRepository.save(any(ProductJpaEntity.class))).thenAnswer(i -> {
            ProductJpaEntity p = i.getArgument(0);
            p.setId(testProductId);
            return p;
        });

        when(categoryRepository.findById(testCategoryId)).thenReturn(Optional.of(new CategoryJpaEntity()));
        when(productSkuRepository.findByProductId(testProductId)).thenReturn(new ArrayList<>());
        when(shopRepository.findById(testShopId)).thenReturn(Optional.of(new ShopJpaEntity()));

        ProductDto result = productService.createProduct(dto);

        assertNotNull(result.getId());
        verify(productRepository).save(any(ProductJpaEntity.class));
        verify(productSkuRepository).saveAll(anyList());
        verify(productSearchRepository).save(any(ProductDocument.class));
    }

    @Test
    void testUpdateProduct_Success() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentShopId).thenReturn(testShopId);

        ProductDto dto = new ProductDto();
        dto.setName("Updated Name");

        when(productRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(ProductJpaEntity.class))).thenReturn(testProduct);
        when(productImageRepository.findByProductIdOrderBySortOrderAsc(testProductId)).thenReturn(new ArrayList<>());
        when(productSkuRepository.findByProductId(testProductId)).thenReturn(new ArrayList<>());
        when(categoryRepository.findById(testCategoryId)).thenReturn(Optional.of(new CategoryJpaEntity()));
        when(shopRepository.findById(testShopId)).thenReturn(Optional.of(new ShopJpaEntity()));

        ProductDto result = productService.updateProduct(testProductId, dto);

        assertEquals("Updated Name", testProduct.getName());
        verify(productRepository).save(testProduct);
        verify(productSearchRepository).save(any(ProductDocument.class));
    }

    @Test
    void testUpdateProduct_Unauthorized() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentShopId).thenReturn(UUID.randomUUID()); // Different shop

        ProductDto dto = new ProductDto();

        when(productRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class, () -> 
            productService.updateProduct(testProductId, dto)
        );

        assertEquals("You do not own this product", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    void testDeleteProduct_Success() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentShopId).thenReturn(testShopId);

        when(productRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));
        when(productImageRepository.findByProductIdOrderBySortOrderAsc(testProductId)).thenReturn(new ArrayList<>());

        productService.deleteProduct(testProductId);

        assertNotNull(testProduct.getDeletedAt());
        verify(productRepository).save(testProduct);
        verify(productSearchRepository).deleteById(testProductId);
    }
}
