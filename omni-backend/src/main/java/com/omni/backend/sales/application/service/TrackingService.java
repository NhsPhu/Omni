package com.omni.backend.sales.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final StringRedisTemplate redisTemplate;

    /**
     * Record a unique visitor for a shop on a specific date.
     * Uses Redis HyperLogLog (PFADD) to efficiently count unique visitors.
     */
    public void trackShopVisitor(UUID shopId, String sessionIdOrIp) {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String key = "shop:" + shopId.toString() + ":visitors:" + dateStr;
        redisTemplate.opsForHyperLogLog().add(key, sessionIdOrIp);
    }

    /**
     * Get the count of unique visitors for a shop on a specific date.
     */
    public long getShopVisitorsCount(UUID shopId, LocalDate date) {
        String dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String key = "shop:" + shopId.toString() + ":visitors:" + dateStr;
        Long count = redisTemplate.opsForHyperLogLog().size(key);
        return count != null ? count : 0L;
    }
}
