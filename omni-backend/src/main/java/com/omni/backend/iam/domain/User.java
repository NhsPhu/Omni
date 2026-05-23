package com.omni.backend.iam.domain;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private UUID id;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    private UserStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    public void activate() {
        this.status = UserStatus.ACTIVE;
    }
    
    public void ban() {
        this.status = UserStatus.BANNED;
    }
    
    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }
}
