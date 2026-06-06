package com.omni.backend.notification.adapter.web;

import com.omni.backend.notification.adapter.persistence.entity.NotificationJpaEntity;
import com.omni.backend.notification.application.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private UUID getUserId(Authentication authentication) {
        com.omni.backend.shared.security.CustomUserDetails userDetails = (com.omni.backend.shared.security.CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<Page<NotificationJpaEntity>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getUserId(authentication), PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable UUID id) {
        notificationService.markAsRead(getUserId(authentication), id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(getUserId(authentication));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(getUserId(authentication));
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }
}

