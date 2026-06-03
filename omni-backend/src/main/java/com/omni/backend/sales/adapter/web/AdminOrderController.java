package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @PostMapping("/child/{id}/dispute-resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resolveDispute(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody ResolveDisputeRequest request) {
        orderService.resolveDispute(id, request.isApproved(), request.getResolutionNote(), getUserId(authentication));
        return ResponseEntity.ok().build();
    }
}

@lombok.Data
class ResolveDisputeRequest {
    private boolean approved;
    private String resolutionNote;
}
