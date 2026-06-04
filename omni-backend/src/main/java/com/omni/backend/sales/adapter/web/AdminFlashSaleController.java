package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.dto.FlashSaleEventDto;
import com.omni.backend.sales.application.dto.FlashSaleItemDto;
import com.omni.backend.sales.application.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/flash-sale")
@RequiredArgsConstructor
public class AdminFlashSaleController {

    private final FlashSaleService flashSaleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlashSaleEventDto> createEvent(@RequestBody FlashSaleEventDto dto) {
        return ResponseEntity.ok(flashSaleService.createEvent(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FlashSaleEventDto>> getAllEvents() {
        return ResponseEntity.ok(flashSaleService.getAllEvents());
    }

    @GetMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FlashSaleEventDto> getEventDetail(@PathVariable UUID eventId) {
        return ResponseEntity.ok(flashSaleService.getEventDetail(eventId));
    }

    @PatchMapping("/items/{itemId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveItem(@PathVariable UUID itemId) {
        flashSaleService.approveItem(itemId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/items/{itemId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectItem(@PathVariable UUID itemId) {
        flashSaleService.rejectItem(itemId);
        return ResponseEntity.ok().build();
    }
}
