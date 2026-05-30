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

    @PostMapping
    public ResponseEntity<Void> handleGhnWebhook(@RequestBody GhnCallbackPayload payload, HttpServletRequest request) {
        log.info("Received GHN webhook from IP {}. Payload: {}", request.getRemoteAddr(), payload);

        if (payload == null || !StringUtils.hasText(payload.getOrderCode())) {
            log.warn("GHN webhook missing order_code");
            return ResponseEntity.badRequest().build();
        }

        ghnWebhookService.processAsync(payload);

        return ResponseEntity.ok().build();
    }
}
