package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.PlatformVoucherDto;
import com.omni.backend.sales.application.service.PlatformVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminPlatformVoucherController {

    private final PlatformVoucherService platformVoucherService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlatformVoucherDto>> getAllPlatformVouchers() {
        return ResponseEntity.ok(platformVoucherService.getAllVouchers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformVoucherDto> createPlatformVoucher(@RequestBody PlatformVoucherDto dto) {
        return ResponseEntity.ok(platformVoucherService.createVoucher(dto));
    }

    @PatchMapping("/{id}/stop")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> stopPlatformVoucher(@PathVariable UUID id) {
        platformVoucherService.stopVoucher(id);
        return ResponseEntity.ok().build();
    }
}
