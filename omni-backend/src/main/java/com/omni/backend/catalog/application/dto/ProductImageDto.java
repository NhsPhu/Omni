package com.omni.backend.catalog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDto implements java.io.Serializable {
    private UUID id;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer sortOrder;
}
