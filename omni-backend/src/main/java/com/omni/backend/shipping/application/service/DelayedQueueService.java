package com.omni.backend.shipping.application.service;

import com.omni.backend.finance.application.service.SettlementService;
import com.omni.backend.shipping.adapter.persistence.entity.DelayedJobJpaEntity;
import com.omni.backend.shipping.adapter.persistence.repository.DelayedJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelayedQueueService {

    private final RedisTemplate<String, String> redisTemplate;
    private final DelayedJobRepository delayedJobRepository;
    private final SettlementService settlementService;

    private static final String DELAYED_KEY = "delayed:complete";

    @Transactional
    public void schedule(UUID shopOrderId, Instant executeAt) {
        // 1. ZADD to Redis
        redisTemplate.opsForZSet().add(DELAYED_KEY, shopOrderId.toString(), executeAt.toEpochMilli());

        // 2. Insert into DB backup
        DelayedJobJpaEntity job = DelayedJobJpaEntity.builder()
                .jobType("AUTO_COMPLETE_ORDER")
                .payload("{\"shopOrderId\": \"" + shopOrderId.toString() + "\"}")
                .executeAt(executeAt.atZone(ZoneId.systemDefault()))
                .status("PENDING")
                .build();
        delayedJobRepository.save(job);
        
        log.info("Scheduled auto-complete job for shop_order {} at {}", shopOrderId, executeAt);
    }

    @Transactional
    public void cancel(UUID shopOrderId) {
        // 1. Remove from Redis ZSET
        redisTemplate.opsForZSet().remove(DELAYED_KEY, shopOrderId.toString());

        // 2. Cancel in DB
        delayedJobRepository.cancelJobByShopOrderId(shopOrderId.toString());
        
        log.info("Cancelled auto-complete job for shop_order {}", shopOrderId);
    }

    @Scheduled(fixedDelay = 60_000)
    public void processDueJobs() {
        long now = System.currentTimeMillis();
        
        // ZRANGEBYSCORE delayed:complete 0 <now_ms> LIMIT 0 50
        Set<String> dueJobs = redisTemplate.opsForZSet().rangeByScore(DELAYED_KEY, 0, now, 0, 50);
        
        if (dueJobs == null || dueJobs.isEmpty()) {
            return;
        }

        for (String shopOrderIdStr : dueJobs) {
            // ZREM to prevent double execution
            Long removed = redisTemplate.opsForZSet().remove(DELAYED_KEY, shopOrderIdStr);
            if (removed != null && removed > 0) {
                try {
                    UUID shopOrderId = UUID.fromString(shopOrderIdStr);
                    settlementService.settle(shopOrderId);
                    
                    // Note: We don't have the job ID easily here from Redis,
                    // but normally we would update the DB status to DONE.
                    // A proper implementation might store the DB Job ID in Redis.
                    log.info("Successfully processed delayed job for shop_order {}", shopOrderId);
                } catch (Exception e) {
                    log.error("Failed to process delayed job for shop_order " + shopOrderIdStr, e);
                    // Add back to retry or update DB to FAILED
                }
            }
        }
    }
}
