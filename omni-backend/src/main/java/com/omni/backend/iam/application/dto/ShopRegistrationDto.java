package com.omni.backend.iam.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class ShopRegistrationDto {

    @NotBlank(message = "Shop name is required")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-ZÀ-ỹ0-9\\s]+$", message = "Shop name must not contain special characters")
    private String name;

    private String description;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;
    
    @NotBlank(message = "Bank name is required")
    private String bankName;
    
    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;
    
    @NotBlank(message = "Bank account name is required")
    @NotBlank(message = "Bank account name is required")
    private String bankAccountName;

    private Integer warehouseProvinceId;
    private Integer warehouseDistrictId;
    private String warehouseWardCode;
}
