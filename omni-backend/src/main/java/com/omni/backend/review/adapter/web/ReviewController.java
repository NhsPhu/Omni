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

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

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

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<ProductReviewJpaEntity>> getProductReviews(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(reviewRepository.findByProductIdAndStatus(productId, "APPROVED", PageRequest.of(page, size)));
    }
}

