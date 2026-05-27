package com.omni.backend.catalog.application.service;

import com.omni.backend.catalog.adapter.persistence.entity.WishlistJpaEntity;
import com.omni.backend.catalog.adapter.persistence.repository.WishlistRepository;
import com.omni.backend.catalog.application.dto.ProductDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> getWishlist(UUID userId) {
        List<WishlistJpaEntity> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return items.stream()
                .map(item -> {
                    var product = item.getProduct();
                    return ProductDto.builder()
                        .id(product.getId())
                        .shopId(product.getShopId())
                        .categoryId(product.getCategoryId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .status(product.getStatus())
                        .avgRating(product.getAvgRating())
                        .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        } else {
            WishlistJpaEntity entity = WishlistJpaEntity.builder()
                    .userId(userId)
                    .productId(productId)
                    .build();
            wishlistRepository.save(entity);
        }
    }

    @Transactional(readOnly = true)
    public boolean checkWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
