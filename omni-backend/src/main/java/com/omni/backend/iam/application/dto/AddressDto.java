package com.omni.backend.iam.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressDto {
    private UUID id;
    private String label;
    private String receiverName;
    private String receiverPhone;
    private String province;
    private String district;
    private String ward;
    private String detail;
    private Boolean isDefault;
    private Integer ghnProvinceId;
    private Integer ghnDistrictId;
    private String ghnWardCode;
}
