package com.omni.backend.iam.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ShopUpdateDto {

    @NotBlank(message = "Shop name is required")
    private String name;

    private String description;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;
    
    private String bankName;
    
    private String bankAccountNumber;
    
    private String bankAccountName;

    private Integer warehouseProvinceId;
    private Integer warehouseDistrictId;
    private String warehouseWardCode;
    private String ghnShopId;

    private String logoUrl;
    private String bannerUrl;
}
