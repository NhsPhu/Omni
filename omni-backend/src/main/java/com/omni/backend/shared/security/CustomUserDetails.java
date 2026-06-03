package com.omni.backend.shared.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails extends User {
    private final UUID id;
    private final UUID shopId;

    public CustomUserDetails(UUID id, UUID shopId, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
        this.shopId = shopId;
    }

    public UUID getId() {
        return id;
    }
    
    public UUID getShopId() {
        return shopId;
    }
}

