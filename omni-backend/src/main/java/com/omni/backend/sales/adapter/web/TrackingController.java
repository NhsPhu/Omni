package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.service.TrackingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/shops/{shopId}/visit")
    public ResponseEntity<Void> trackShopVisit(@PathVariable UUID shopId, HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // Use User-Agent + IP as a pseudo-session identifier for anonymous tracking
        String userAgent = request.getHeader("User-Agent");
        String visitorId = ipAddress + "|" + (userAgent != null ? userAgent : "");
        
        trackingService.trackShopVisitor(shopId, visitorId);
        
        return ResponseEntity.ok().build();
    }
}
