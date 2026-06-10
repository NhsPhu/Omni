package com.omni.backend.notification.application.service;

import com.omni.backend.notification.adapter.persistence.entity.FcmTokenJpaEntity;
import com.omni.backend.notification.adapter.persistence.entity.NotificationJpaEntity;
import com.omni.backend.notification.adapter.persistence.repository.FcmTokenRepository;
import com.omni.backend.notification.adapter.persistence.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import org.mockito.MockedStatic;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private FcmTokenRepository fcmTokenRepository;

    @InjectMocks
    private NotificationService notificationService;

    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
    }

    @Test
    void testSendSystemNotification_WithFcmToken() throws Exception {
        String title = "New Order";
        String message = "You have a new order.";
        String type = "ORDER";

        FcmTokenJpaEntity tokenEntity = FcmTokenJpaEntity.builder()
                .userId(testUserId)
                .token("test-device-token")
                .build();

        when(fcmTokenRepository.findByUserId(testUserId)).thenReturn(Collections.singletonList(tokenEntity));
        when(notificationRepository.save(any(NotificationJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        try (MockedStatic<FirebaseMessaging> mockedFirebase = mockStatic(FirebaseMessaging.class)) {
            FirebaseMessaging mockMessaging = mock(FirebaseMessaging.class);
            mockedFirebase.when(FirebaseMessaging::getInstance).thenReturn(mockMessaging);
            when(mockMessaging.send(any(Message.class))).thenReturn("message-id");

            notificationService.sendSystemNotification(testUserId, title, message, type);

            ArgumentCaptor<NotificationJpaEntity> notifCaptor = ArgumentCaptor.forClass(NotificationJpaEntity.class);
            verify(notificationRepository).save(notifCaptor.capture());

            NotificationJpaEntity savedNotif = notifCaptor.getValue();
            assertEquals(testUserId, savedNotif.getUserId());
            assertEquals(title, savedNotif.getTitle());
            assertEquals(message, savedNotif.getMessage());
            assertEquals("SYSTEM", savedNotif.getType());

            verify(mockMessaging).send(any(Message.class));
        }
    }

    @Test
    void testSendSystemNotification_NoFcmToken() {
        String title = "Promo";
        String message = "Special discount for you.";
        String type = "PROMO";

        when(fcmTokenRepository.findByUserId(testUserId)).thenReturn(Collections.emptyList());
        when(notificationRepository.save(any(NotificationJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        notificationService.sendSystemNotification(testUserId, title, message, type);

        verify(notificationRepository).save(any(NotificationJpaEntity.class));
        verify(fcmTokenRepository).findByUserId(testUserId);
    }

    @Test
    void testSaveFcmToken_NewToken() {
        String token = "new-token";

        when(fcmTokenRepository.findByToken(token)).thenReturn(Optional.empty());

        notificationService.saveFcmToken(testUserId, token, "Android");

        ArgumentCaptor<FcmTokenJpaEntity> captor = ArgumentCaptor.forClass(FcmTokenJpaEntity.class);
        verify(fcmTokenRepository).save(captor.capture());

        FcmTokenJpaEntity saved = captor.getValue();
        assertEquals(testUserId, saved.getUserId());
        assertEquals(token, saved.getToken());
    }

    @Test
    void testSaveFcmToken_UpdateExistingToken() {
        String oldToken = "old-token";
        String newToken = "old-token"; // We query by token

        FcmTokenJpaEntity existingToken = FcmTokenJpaEntity.builder()
                .userId(UUID.randomUUID())
                .token(oldToken)
                .build();

        when(fcmTokenRepository.findByToken(newToken)).thenReturn(Optional.of(existingToken));

        notificationService.saveFcmToken(testUserId, newToken, "Android");

        ArgumentCaptor<FcmTokenJpaEntity> captor = ArgumentCaptor.forClass(FcmTokenJpaEntity.class);
        verify(fcmTokenRepository).save(captor.capture());

        FcmTokenJpaEntity saved = captor.getValue();
        assertEquals(testUserId, saved.getUserId());
        assertEquals(newToken, saved.getToken());
    }
}
