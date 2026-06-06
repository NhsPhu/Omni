package com.omni.backend.review.application.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.ZonedDateTime;

@Data
@Builder
public class ReviewResponseDto {
    private UUID id;
    private String userName;
    private Integer rating;
    private String comment;
    private ZonedDateTime date;
    private String sku;
    private Integer helpful;
    private String replyContent;
}
