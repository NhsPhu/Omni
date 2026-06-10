package com.omni.backend.sales.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.HyperLogLogOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private HyperLogLogOperations<String, String> hyperLogLogOperations;

    @InjectMocks
    private TrackingService trackingService;

    private final UUID testShopId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForHyperLogLog()).thenReturn(hyperLogLogOperations);
    }

    @Test
    void testTrackShopVisitor() {
        String visitorId = "192.168.1.1|Mozilla/5.0";
        String expectedKey = "shop:" + testShopId.toString() + ":visitors:" + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

        trackingService.trackShopVisitor(testShopId, visitorId);

        verify(hyperLogLogOperations, times(1)).add(expectedKey, visitorId);
    }

    @Test
    void testGetShopVisitorsCount() {
        LocalDate date = LocalDate.now();
        String expectedKey = "shop:" + testShopId.toString() + ":visitors:" + date.format(DateTimeFormatter.ISO_LOCAL_DATE);

        when(hyperLogLogOperations.size(expectedKey)).thenReturn(150L);

        long count = trackingService.getShopVisitorsCount(testShopId, date);

        assertEquals(150L, count);
        verify(hyperLogLogOperations, times(1)).size(expectedKey);
    }

    @Test
    void testGetShopVisitorsCount_NullReturn() {
        LocalDate date = LocalDate.now();
        String expectedKey = "shop:" + testShopId.toString() + ":visitors:" + date.format(DateTimeFormatter.ISO_LOCAL_DATE);

        when(hyperLogLogOperations.size(expectedKey)).thenReturn(null);

        long count = trackingService.getShopVisitorsCount(testShopId, date);

        assertEquals(0L, count);
        verify(hyperLogLogOperations, times(1)).size(expectedKey);
    }
}
