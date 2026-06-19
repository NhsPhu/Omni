package com.omni.backend.aichat.adapter.web;

import com.omni.backend.aichat.application.dto.AiChatMessageDto;
import com.omni.backend.aichat.application.service.AiChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.ZonedDateTime;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class AiChatWebSocketController {

    private final AiChatService aiChatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/ai-chat.send")
    public void sendMessage(@Payload SendAiMessageRequest request) {
        AiChatMessageDto userMessage = AiChatMessageDto.builder()
                .sessionId(request.getSessionId())
                .senderType("USER")
                .content(request.getContent())
                .createdAt(ZonedDateTime.now())
                .build();
        messagingTemplate.convertAndSend("/topic/ai-chat/" + request.getSessionId(), userMessage);

        AiChatMessageDto aiReply = aiChatService.processUserMessage(
                request.getSessionId(),
                request.getUserId(),
                request.getShopId(),
                request.getContent()
        );

        messagingTemplate.convertAndSend("/topic/ai-chat/" + request.getSessionId(), aiReply);
    }

    @Data
    public static class SendAiMessageRequest {
        private UUID sessionId;
        private UUID userId;
        private UUID shopId;
        private String content;
    }
}
