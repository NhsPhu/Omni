package com.omni.backend.aichat.adapter.web;

import com.omni.backend.aichat.application.service.AiChatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/ai-chat")
@RequiredArgsConstructor
public class PublicAiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/anonymous")
    public ResponseEntity<Map<String, String>> anonymousChat(@RequestBody AnonymousChatRequest request) {
        String aiReply = aiChatService.callN8nWebhook(null, null, null, request.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("output", aiReply);
        return ResponseEntity.ok(response);
    }

    @Data
    public static class AnonymousChatRequest {
        private String sessionId;
        private String message;
    }
}
