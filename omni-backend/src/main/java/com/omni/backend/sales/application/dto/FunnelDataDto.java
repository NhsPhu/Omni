package com.omni.backend.sales.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FunnelDataDto {
    private long views;
    private long carts;
    private long orders;
    private long successfulPayments;
}
