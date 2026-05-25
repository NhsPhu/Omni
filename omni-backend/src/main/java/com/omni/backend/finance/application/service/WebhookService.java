package com.omni.backend.finance.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.omni.backend.finance.adapter.persistence.entity.WebhookEventJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebhookService {

    private final WebhookEventRepository webhookRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public boolean processIdempotentEvent(String provider, String eventId, Object payload, Runnable processor) {
        try {
            String payloadJson = objectMapper.writeValueAsString(payload);
            
            WebhookEventJpaEntity event = WebhookEventJpaEntity.builder()
                    .provider(provider)
                    .externalEventId(eventId)
                    .payload(payloadJson)
                    .status("PENDING")
                    .build();
            
            webhookRepository.saveAndFlush(event); // Force flush to catch constraint violation
            
            try {
                // Execute actual business logic (e.g. mark order as PAID)
                processor.run();
                event.setStatus("PROCESSED");
                webhookRepository.save(event);
                return true;
            } catch (Exception e) {
                log.error("Failed to process webhook event {}", eventId, e);
                event.setStatus("FAILED");
                event.setErrorMessage(e.getMessage());
                webhookRepository.save(event);
                throw e; // Rethrow to rollback the transaction
            }
        } catch (DataIntegrityViolationException e) {
            log.info("Idempotency hit for event {}. Already processed.", eventId);
            return false; // Already processed
        } catch (Exception e) {
            log.error("Error saving webhook event {}", eventId, e);
            throw new RuntimeException(e);
        }
    }
}
