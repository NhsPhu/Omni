package com.omni.backend.notification.application.service;

import com.omni.backend.notification.adapter.persistence.entity.NotificationJpaEntity;
import com.omni.backend.notification.adapter.persistence.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationJpaEntity> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        NotificationJpaEntity notif = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if (!notif.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (notif.getReadAt() == null) {
            notif.setReadAt(ZonedDateTime.now());
            notificationRepository.save(notif);
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }

    // Called by Event Listeners
    @Transactional
    public void sendSystemNotification(UUID userId, String title, String message, String payload) {
        NotificationJpaEntity notif = NotificationJpaEntity.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type("SYSTEM")
                .payload(payload)
                .build();
        notificationRepository.save(notif);
    }
}
