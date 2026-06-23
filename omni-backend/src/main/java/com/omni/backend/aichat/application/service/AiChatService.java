package com.omni.backend.aichat.application.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omni.backend.aichat.adapter.persistence.entity.AiChatMessageJpaEntity;
import com.omni.backend.aichat.adapter.persistence.entity.AiChatSessionJpaEntity;
import com.omni.backend.aichat.adapter.persistence.repository.AiChatMessageRepository;
import com.omni.backend.aichat.adapter.persistence.repository.AiChatSessionRepository;
import com.omni.backend.aichat.application.dto.AiChatMessageDto;
import com.omni.backend.aichat.application.dto.AiChatSessionDto;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final AiChatSessionRepository sessionRepo;
    private final AiChatMessageRepository messageRepo;
    private final ObjectMapper objectMapper;

    // Initialized in @PostConstruct to avoid conflict with @RequiredArgsConstructor
    private HttpClient httpClient;

    @Value("${omni.n8n.webhook.url:http://localhost:5678/webhook/omni-ai-chat}")
    private String n8nWebhookUrl;

    @PostConstruct
    public void init() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Transactional
    public AiChatSessionDto getOrCreateSession(UUID userId, UUID shopId) {
        AiChatSessionJpaEntity session = sessionRepo.findByUserIdAndShopIdAndStatus(userId, shopId, "ACTIVE")
                .orElseGet(() -> {
                    AiChatSessionJpaEntity newSession = AiChatSessionJpaEntity.builder()
                            .userId(userId)
                            .shopId(shopId)
                            .status("ACTIVE")
                            .build();
                    return sessionRepo.save(newSession);
                });
        return mapToSessionDto(session);
    }

    @Transactional(readOnly = true)
    public List<AiChatSessionDto> getUserSessions(UUID userId) {
        return sessionRepo.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::mapToSessionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AiChatMessageDto> getMessages(UUID sessionId) {
        return messageRepo.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AiChatMessageDto processUserMessage(UUID sessionId, UUID userId, UUID shopId, String content) {
        AiChatMessageJpaEntity userMsg = AiChatMessageJpaEntity.builder()
                .sessionId(sessionId)
                .senderType("USER")
                .content(content)
                .build();
        messageRepo.save(userMsg);

        String aiReply = callN8nWebhook(sessionId, userId, shopId, content);

        AiChatMessageJpaEntity aiMsg = AiChatMessageJpaEntity.builder()
                .sessionId(sessionId)
                .senderType("AI")
                .content(aiReply)
                .build();
        messageRepo.save(aiMsg);

        return mapToMessageDto(aiMsg);
    }

    public String callN8nWebhook(UUID sessionId, UUID userId, UUID shopId, String content) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("sessionId", sessionId != null ? sessionId.toString() : "anonymous");
            if (userId != null) {
                body.put("userId", userId.toString());
            }
            if (shopId != null) {
                body.put("shopId", shopId.toString());
            }
            body.put("message", content);

            String requestBody = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(n8nWebhookUrl))
                    .timeout(Duration.ofSeconds(60))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();
            
            log.info("Sending message to n8n webhook asynchronously: {}", n8nWebhookUrl);
            
            CompletableFuture<HttpResponse<String>> futureResponse = httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            
            HttpResponse<String> response = futureResponse.get(120, TimeUnit.SECONDS);

            if (response.statusCode() >= 200 && response.statusCode() < 300 && response.body() != null) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("output")) {
                    return root.get("output").asText();
                } else if (root.has("text")) {
                    return root.get("text").asText();
                } else if (root.has("message")) {
                    return root.get("message").asText();
                }
                return response.body();
            }
            log.error("n8n returned error status: {}. Body: {}", response.statusCode(), response.body());
            return "Xin lỗi, hiện tại tôi đang gặp sự cố khi xử lý yêu cầu của bạn. (Lỗi n8n: " + response.statusCode() + ")";
        } catch (Exception e) {
            log.error("Error calling n8n webhook: {}", e.getMessage(), e);
            return "Xin lỗi, hiện tại tôi không thể kết nối tới máy chủ AI. Vui lòng thử lại sau. (Lỗi mạng: " + e.getMessage() + ")";
        }
    }

    private AiChatMessageDto mapToMessageDto(AiChatMessageJpaEntity entity) {
        return AiChatMessageDto.builder()
                .id(entity.getId())
                .sessionId(entity.getSessionId())
                .senderType(entity.getSenderType())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private AiChatSessionDto mapToSessionDto(AiChatSessionJpaEntity entity) {
        return AiChatSessionDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .shopId(entity.getShopId())
                .status(entity.getStatus())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
