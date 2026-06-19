package com.omni.backend.chat.adapter.web;

import com.omni.backend.chat.application.dto.ChatMessageDto;
import com.omni.backend.chat.application.service.ChatService;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.aichat.application.service.AiChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.concurrent.CompletableFuture;

import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ShopRepository shopRepository;
    private final AiChatService aiChatService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request) {
        // Save message to database
        ChatMessageDto savedMessage = chatService.saveMessage(
                request.getRoomId(),
                request.getSenderId(),
                request.getSenderType(),
                request.getContent()
        );

        // Send to appropriate queue based on who the receiver is
        // If sender is USER, receiver is SHOP
        if ("USER".equals(request.getSenderType())) {
            messagingTemplate.convertAndSend("/shop/" + request.getReceiverId() + "/queue/messages", savedMessage);
            
            // Check if Shop AI is enabled
            shopRepository.findById(request.getReceiverId()).ifPresent(shop -> {
                if (Boolean.TRUE.equals(shop.getAiChatbotEnabled())) {
                    log.info("AI Chatbot is enabled for shop {}. Intercepting message.", shop.getId());
                    CompletableFuture.runAsync(() -> {
                        String aiReply = aiChatService.callN8nWebhook(request.getRoomId(), request.getSenderId(), shop.getId(), request.getContent());
                        
                        // Save AI reply as SHOP message
                        ChatMessageDto aiSavedMessage = chatService.saveMessage(
                                request.getRoomId(),
                                shop.getOwnerId(),
                                "SHOP",
                                aiReply
                        );
                        
                        // Broadcast AI reply back to USER
                        messagingTemplate.convertAndSend("/user/" + request.getSenderId() + "/queue/messages", aiSavedMessage);
                        // Also broadcast back to SHOP so vendor sees the AI's reply
                        messagingTemplate.convertAndSend("/shop/" + shop.getId() + "/queue/messages", aiSavedMessage);
                    });
                }
            });
            
        } else {
            // Sender is SHOP, receiver is USER
            messagingTemplate.convertAndSend("/user/" + request.getReceiverId() + "/queue/messages", savedMessage);
        }
    }

    @Data
    public static class SendMessageRequest {
        private UUID roomId;
        private UUID senderId;
        private String senderType; // USER or SHOP
        private UUID receiverId;
        private String content;
    }
}
