package com.omni.backend.shipping.adapter.web;

import com.omni.backend.shipping.application.dto.ghn.GhnCallbackPayload;
import com.omni.backend.shipping.application.service.GhnWebhookService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/webhook/ghn")
@RequiredArgsConstructor
public class GhnWebhookController {

    private final GhnWebhookService ghnWebhookService;

    private static final String GHN_IP_PREFIX = "103.191.145.";

    @PostMapping
    public ResponseEntity<Void> handleGhnWebhook(@RequestBody GhnCallbackPayload payload, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        log.info("Received GHN webhook from IP {}. Payload: {}", clientIp, payload);

        if (!clientIp.startsWith(GHN_IP_PREFIX) && !clientIp.equals("127.0.0.1") && !clientIp.equals("0:0:0:0:0:0:0:1")) {
            log.warn("Blocked webhook request from unauthorized IP: {}", clientIp);
            return ResponseEntity.status(403).build();
        }

        if (payload == null || !StringUtils.hasText(payload.getOrderCode())) {
            log.warn("GHN webhook missing order_code");
            return ResponseEntity.badRequest().build();
        }

        ghnWebhookService.processAsync(payload);

        return ResponseEntity.ok().build();
    }
}
