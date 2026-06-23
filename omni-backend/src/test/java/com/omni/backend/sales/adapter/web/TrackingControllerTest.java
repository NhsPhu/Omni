package com.omni.backend.sales.adapter.web;

import com.omni.backend.sales.application.service.TrackingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TrackingController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
class TrackingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrackingService trackingService;

    @MockBean
    private com.omni.backend.shared.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.omni.backend.shared.security.CustomUserDetailsService customUserDetailsService;

    @MockBean
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Test
    void testTrackShopVisit() throws Exception {
        UUID shopId = UUID.randomUUID();

        mockMvc.perform(post("/api/tracking/shops/{shopId}/visit", shopId)
                .header("X-Forwarded-For", "192.168.1.100")
                .header("User-Agent", "Mozilla/5.0"))
                .andExpect(status().isOk());

        verify(trackingService).trackShopVisitor(eq(shopId), eq("192.168.1.100|Mozilla/5.0"));
    }

    @Test
    void testTrackShopVisit_FallbackToRemoteAddr() throws Exception {
        UUID shopId = UUID.randomUUID();

        mockMvc.perform(post("/api/tracking/shops/{shopId}/visit", shopId)
                .with(request -> {
                    request.setRemoteAddr("10.0.0.1");
                    return request;
                })
                .header("User-Agent", "Chrome/91.0"))
                .andExpect(status().isOk());

        verify(trackingService).trackShopVisitor(eq(shopId), eq("10.0.0.1|Chrome/91.0"));
    }
}
