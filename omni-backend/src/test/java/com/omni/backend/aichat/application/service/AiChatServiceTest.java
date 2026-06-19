package com.omni.backend.aichat.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.omni.backend.aichat.adapter.persistence.entity.AiChatMessageJpaEntity;
import com.omni.backend.aichat.adapter.persistence.entity.AiChatSessionJpaEntity;
import com.omni.backend.aichat.adapter.persistence.repository.AiChatMessageRepository;
import com.omni.backend.aichat.adapter.persistence.repository.AiChatSessionRepository;
import com.omni.backend.aichat.application.dto.AiChatMessageDto;
import com.omni.backend.aichat.application.dto.AiChatSessionDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private AiChatSessionRepository sessionRepo;

    @Mock
    private AiChatMessageRepository messageRepo;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AiChatService aiChatService;

    private final UUID userId = UUID.randomUUID();
    private final UUID shopId = UUID.randomUUID();
    private final UUID sessionId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiChatService, "n8nWebhookUrl", "http://localhost:5678/webhook");
    }

    @Test
    void getOrCreateSession_ExistingSession_ReturnsDto() {
        AiChatSessionJpaEntity existingSession = AiChatSessionJpaEntity.builder()
                .id(sessionId)
                .userId(userId)
                .shopId(shopId)
                .status("ACTIVE")
                .build();

        when(sessionRepo.findByUserIdAndShopIdAndStatus(userId, shopId, "ACTIVE"))
                .thenReturn(Optional.of(existingSession));

        AiChatSessionDto result = aiChatService.getOrCreateSession(userId, shopId);

        assertNotNull(result);
        assertEquals(sessionId, result.getId());
    }

    @Test
    void getOrCreateSession_NewSession_CreatesAndReturnsDto() {
        when(sessionRepo.findByUserIdAndShopIdAndStatus(userId, shopId, "ACTIVE"))
                .thenReturn(Optional.empty());

        AiChatSessionJpaEntity newSession = AiChatSessionJpaEntity.builder()
                .id(sessionId)
                .userId(userId)
                .shopId(shopId)
                .status("ACTIVE")
                .build();

        when(sessionRepo.save(any(AiChatSessionJpaEntity.class))).thenReturn(newSession);

        AiChatSessionDto result = aiChatService.getOrCreateSession(userId, shopId);

        assertNotNull(result);
        assertEquals(sessionId, result.getId());
        verify(sessionRepo).save(any(AiChatSessionJpaEntity.class));
    }
}
