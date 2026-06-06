package com.omni.backend.chat.adapter.web;

import com.omni.backend.chat.application.dto.ChatMessageDto;
import com.omni.backend.chat.application.dto.ChatRoomDto;
import com.omni.backend.chat.application.service.ChatService;
import com.omni.backend.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // --- BUYER ENDPOINTS ---

    @PostMapping("/rooms/shop/{shopId}")
    public ResponseEntity<ChatRoomDto> getOrCreateRoomForUser(@PathVariable UUID shopId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(chatService.getOrCreateRoom(userId, shopId));
    }

    @GetMapping("/rooms/me")
    public ResponseEntity<Page<ChatRoomDto>> getMyRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(chatService.getUserRooms(userId, page, size));
    }

    // --- SELLER ENDPOINTS ---

    @PreAuthorize("hasRole('VENDOR')")
    @GetMapping("/rooms/shop")
    public ResponseEntity<Page<ChatRoomDto>> getShopRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID shopId = SecurityUtils.getCurrentShopId();
        return ResponseEntity.ok(chatService.getShopRooms(shopId, page, size));
    }

    // --- SHARED ENDPOINTS ---

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageDto>> getRoomMessages(
            @PathVariable UUID roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        // Basic check missing: verify user is part of the room
        return ResponseEntity.ok(chatService.getMessages(roomId, page, size));
    }

    @PatchMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID roomId, @RequestBody Map<String, String> body) {
        String readerType = body.getOrDefault("readerType", "USER"); // "USER" or "SHOP"
        chatService.markMessagesAsRead(roomId, readerType);
        return ResponseEntity.ok().build();
    }
}
