package com.omni.backend.iam.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressDto {
    private UUID id;
    private String fullName;
    private String phone;
    private String street;
    private String ward;
    private String district;
    private String city;
    private Boolean isDefault;
}
