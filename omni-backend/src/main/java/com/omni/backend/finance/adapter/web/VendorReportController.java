package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.application.service.AdminReportService;
import com.omni.backend.iam.application.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/vendor/revenue")
@RequiredArgsConstructor
public class VendorReportController {

    private final AdminReportService adminReportService;
    private final ShopService shopService;

    @GetMapping("/daily")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Map<String, Object>>> getVendorDailyRevenue(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.omni.backend.shared.security.CustomUserDetails userDetails,
            @RequestParam(defaultValue = "7") int days) {
        
        com.omni.backend.iam.application.dto.ShopResponseDto shop = shopService.getShopByOwner(userDetails.getId());
        return ResponseEntity.ok(adminReportService.getVendorDailyRevenue(shop.getId(), days));
    }
}
