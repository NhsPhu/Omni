package com.omni.backend.notification.application.service;

import com.omni.backend.notification.adapter.persistence.entity.NotificationJpaEntity;
import com.omni.backend.notification.adapter.persistence.repository.NotificationRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.omni.backend.notification.adapter.persistence.entity.FcmTokenJpaEntity;
import com.omni.backend.notification.adapter.persistence.repository.FcmTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FcmTokenRepository fcmTokenRepository;

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
    
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void saveFcmToken(UUID userId, String token, String deviceInfo) {
        fcmTokenRepository.findByToken(token).ifPresentOrElse(
            existing -> {
                if (!existing.getUserId().equals(userId)) {
                    existing.setUserId(userId);
                    fcmTokenRepository.save(existing);
                }
            },
            () -> {
                FcmTokenJpaEntity newToken = FcmTokenJpaEntity.builder()
                        .userId(userId)
                        .token(token)
                        .deviceInfo(deviceInfo)
                        .build();
                fcmTokenRepository.save(newToken);
            }
        );
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

        // Send FCM Push Notification
        try {
            java.util.List<FcmTokenJpaEntity> tokens = fcmTokenRepository.findByUserId(userId);
            for (FcmTokenJpaEntity tokenEntity : tokens) {
                Message fcmMessage = Message.builder()
                        .setToken(tokenEntity.getToken())
                        .setNotification(Notification.builder()
                                .setTitle(title)
                                .setBody(message)
                                .build())
                        .putData("payload", payload != null ? payload : "")
                        .build();
                
                String response = FirebaseMessaging.getInstance().send(fcmMessage);
                log.info("Successfully sent FCM message: {}", response);
            }
        } catch (Exception e) {
            log.warn("Failed to send FCM notification: {}", e.getMessage());
        }
    }
}
