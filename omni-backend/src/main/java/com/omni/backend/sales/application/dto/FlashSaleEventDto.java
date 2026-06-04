package com.omni.backend.sales.application.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleEventDto {
    private UUID id;
    private String title;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private Integer maxItems;
    private String status;
    private String bannerUrl;
    private ZonedDateTime createdAt;
    private Long registeredCount;
    private Long approvedCount;
    private List<FlashSaleItemDto> items;
}
