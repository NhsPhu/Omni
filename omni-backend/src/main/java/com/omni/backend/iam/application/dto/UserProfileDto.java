package com.omni.backend.iam.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String role;
    private String provider;
    private ZonedDateTime createdAt;
    private boolean hasPin;
}
