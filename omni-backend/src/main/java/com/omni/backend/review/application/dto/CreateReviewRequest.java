package com.omni.backend.review.application.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateReviewRequest {
    private UUID productId;
    private UUID orderItemId;
    private Integer rating;
    private String comment;
    private List<String> imageUrls;
}
