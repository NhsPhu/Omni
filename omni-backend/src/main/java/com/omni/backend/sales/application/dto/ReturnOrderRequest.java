package com.omni.backend.sales.application.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReturnOrderRequest {
    private String reasonType;
    private String reasonDetails;
    private List<String> images;
}
