package com.omni.backend.review.adapter.web;

import com.omni.backend.review.adapter.persistence.entity.ProductReviewJpaEntity;
import com.omni.backend.review.adapter.persistence.repository.ReviewRepository;
import com.omni.backend.review.application.dto.CreateReviewRequest;
import com.omni.backend.review.application.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.review.application.dto.ReviewResponseDto;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/me/reviews")
    public ResponseEntity<ProductReviewJpaEntity> createReview(
            Authentication authentication,
            @RequestBody CreateReviewRequest request) {
        
        ProductReviewJpaEntity review = reviewService.createReview(getUserId(authentication), request);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/me/reviews/items")
    public ResponseEntity<java.util.List<UUID>> getReviewedItems(Authentication authentication) {
        java.util.List<UUID> items = reviewRepository.findByUserId(getUserId(authentication))
            .stream()
            .map(ProductReviewJpaEntity::getOrderItemId)
            .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<ReviewResponseDto>> getProductReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ProductReviewJpaEntity> reviews = reviewRepository.findByProductIdAndStatus(productId, "APPROVED", PageRequest.of(page, size));
        
        Page<ReviewResponseDto> response = reviews.map(r -> {
            String userName = userRepository.findById(r.getUserId())
                    .map(UserJpaEntity::getFullName)
                    .orElse("Khách hàng ẩn danh");
                    
            return ReviewResponseDto.builder()
                    .id(r.getId())
                    .userName(userName)
                    .rating(r.getRating())
                    .comment(r.getComment())
                    .date(r.getCreatedAt())
                    .sku("") // Not implemented in entity yet
                    .helpful(0)
                    .replyContent(r.getReplyContent())
                    .build();
        });
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vendor/reviews")
    public ResponseEntity<Page<ProductReviewJpaEntity>> getVendorReviews(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        UUID vendorId = getUserId(authentication);
        // We'll need ShopRepository to get shopId, but for now just query by shopId directly from ReviewService or use a custom query.
        // As a shortcut, assuming ReviewRepository has findByShopId
        // Wait, ReviewRepository doesn't have it yet! Let's just return a stub page or create the query.
        // Actually, we'll implement it via ReviewService.
        Page<ProductReviewJpaEntity> reviews = reviewService.getVendorReviews(vendorId, PageRequest.of(page, size));
        return ResponseEntity.ok(reviews);
    }

    @PatchMapping("/vendor/reviews/{id}/reply")
    public ResponseEntity<ProductReviewJpaEntity> replyToReview(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> payload) {
        
        UUID vendorId = getUserId(authentication);
        String replyContent = payload.get("replyContent");
        ProductReviewJpaEntity updated = reviewService.replyToReview(vendorId, id, replyContent);
        return ResponseEntity.ok(updated);
    }
}

