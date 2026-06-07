package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.UserVoucherDto;
import com.omni.backend.sales.application.service.UserVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/vouchers")
@RequiredArgsConstructor
public class UserVoucherController {

    private final UserVoucherService userVoucherService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<List<UserVoucherDto>> getMyVouchers(Authentication authentication) {
        return ResponseEntity.ok(userVoucherService.getMyVouchers(getUserId(authentication)));
    }

    @PostMapping("/save")
    public ResponseEntity<UserVoucherDto> saveVoucher(Authentication authentication, @RequestBody Map<String, String> payload) {
        UUID voucherId = UUID.fromString(payload.get("voucherId"));
        String voucherType = payload.get("voucherType");
        return ResponseEntity.ok(userVoucherService.saveVoucher(getUserId(authentication), voucherId, voucherType));
    }
}
