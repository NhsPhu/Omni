package com.omni.backend.aichat.adapter.web;

import com.omni.backend.aichat.adapter.persistence.repository.AiChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics/ai")
@RequiredArgsConstructor
public class AiAnalyticsController {

    private final AiChatSessionRepository sessionRepository;

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAiAnalyticsOverview() {
        long totalSessions = sessionRepository.count();
        // Here you would normally fetch more complex metrics, e.g. from Prometheus or custom queries
        // For demonstration, we'll return the total sessions and a mock average response time
        
        Map<String, Object> response = new HashMap<>();
        response.put("totalSessions", totalSessions);
        response.put("averageResponseTime", "1.1s"); // Mock value, in a real app query from Micrometer Timer
        response.put("growthPercentage", 15.5); // Mock growth
        
        return ResponseEntity.ok(response);
    }
}
