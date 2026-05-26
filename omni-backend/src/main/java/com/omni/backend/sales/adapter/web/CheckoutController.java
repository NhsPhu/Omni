package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.CheckoutRequest;
import com.omni.backend.sales.application.dto.CheckoutResponse;
import com.omni.backend.sales.application.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        UUID userId = getUserId(authentication);
        CheckoutResponse response = checkoutService.checkout(userId, request);
        return ResponseEntity.ok(response);
    }
}

