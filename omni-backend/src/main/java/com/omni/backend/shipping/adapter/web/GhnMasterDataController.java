package com.omni.backend.shipping.adapter.web;

import com.omni.backend.shipping.application.service.GhnMasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/ghn")
@RequiredArgsConstructor
public class GhnMasterDataController {

    private final GhnMasterDataService ghnMasterDataService;

    @GetMapping("/provinces")
    public ResponseEntity<List<Map<String, Object>>> getProvinces() {
        return ResponseEntity.ok(ghnMasterDataService.getProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<Map<String, Object>>> getDistricts(@RequestParam int provinceId) {
        return ResponseEntity.ok(ghnMasterDataService.getDistricts(provinceId));
    }

    @GetMapping("/wards")
    public ResponseEntity<List<Map<String, Object>>> getWards(@RequestParam int districtId) {
        return ResponseEntity.ok(ghnMasterDataService.getWards(districtId));
    }
}
