package com.omni.backend.chat.adapter.web;

import com.omni.backend.chat.application.dto.ChatMessageDto;
import com.omni.backend.chat.application.service.ChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

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
