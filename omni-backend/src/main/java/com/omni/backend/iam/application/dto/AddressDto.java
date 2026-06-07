package com.omni.backend.iam.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressDto {
    private UUID id;
    private String label;
    @jakarta.validation.constraints.NotBlank(message = "Receiver name is required")
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Receiver name must not contain special characters or numbers")
    private String receiverName;
    @jakarta.validation.constraints.NotBlank(message = "Receiver phone is required")
    @jakarta.validation.constraints.Pattern(regexp = "^(0[3|5|7|8|9])+([0-9]{8})$", message = "Invalid phone number format")
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
