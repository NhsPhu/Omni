package com.omni.backend.iam.application.dto;

import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@Builder
public class ShopResponseDto {
    private UUID id;
    private UUID ownerId;
    private String name;
    private String description;
    private String status;
    private String address;
    private String pickupAddress;
    private BigDecimal rating;
    private Integer totalSales;
    private ZonedDateTime createdAt;
}
