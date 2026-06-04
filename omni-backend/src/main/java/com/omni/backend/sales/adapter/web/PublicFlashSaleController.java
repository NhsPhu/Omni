package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.FlashSaleEventDto;
import com.omni.backend.sales.application.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/flash-sale")
@RequiredArgsConstructor
public class PublicFlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping("/active")
    public ResponseEntity<FlashSaleEventDto> getActiveFlashSale() {
        FlashSaleEventDto event = flashSaleService.getActiveEvent();
        if (event == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(event);
    }
}
