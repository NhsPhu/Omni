package com.omni.backend.shipping.application.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GhnCallbackPayload {
    @JsonProperty("order_code")
    private String orderCode;

    private String status;

    @JsonProperty("status_name")
    private String statusName;

    private long time;

    @JsonProperty("cod_amount")
    private long codAmount;

    @JsonProperty("total_fee")
    private long totalFee;

    private String description;

    @JsonProperty("warehouse_location")
    private String warehouseLocation;
}
