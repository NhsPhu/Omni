package com.omni.backend.iam.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialLoginRequest {

    @NotBlank(message = "Provider không được để trống")
    private String provider;     // "GOOGLE" | "FACEBOOK"

    @NotBlank(message = "Access token không được để trống")
    private String accessToken;  // token từ Google/Facebook SDK phía Frontend
}
