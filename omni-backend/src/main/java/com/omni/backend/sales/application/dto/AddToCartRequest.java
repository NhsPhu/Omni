package com.omni.backend.sales.application.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AddToCartRequest {
    private UUID skuId;
    private Integer quantity;
}
