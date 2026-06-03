package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.application.dto.SystemReportDto;
import com.omni.backend.finance.application.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemReportDto> getSystemReport() {
        return ResponseEntity.ok(adminReportService.getSystemReport());
    }

    @GetMapping("/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getPlatformDailyRevenue(@org.springframework.web.bind.annotation.RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(adminReportService.getPlatformDailyRevenue(days));
    }
}
