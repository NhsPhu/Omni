package com.omni.backend.aichat.adapter.web;

import com.omni.backend.aichat.application.dto.AiChatMessageDto;
import com.omni.backend.aichat.application.dto.AiChatSessionDto;
import com.omni.backend.aichat.application.service.AiChatService;
import com.omni.backend.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/sessions")
    public ResponseEntity<AiChatSessionDto> getOrCreateSession(@RequestParam(required = false) UUID shopId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiChatService.getOrCreateSession(userId, shopId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<AiChatSessionDto>> getMySessions() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(aiChatService.getUserSessions(userId));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<AiChatMessageDto>> getSessionMessages(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(aiChatService.getMessages(sessionId));
    }
}
