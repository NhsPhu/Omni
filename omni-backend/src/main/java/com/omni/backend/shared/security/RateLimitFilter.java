package com.omni.backend.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private static final int MAX_REQUESTS_PER_MINUTE = 1000;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        String ip = getClientIP(request);
        String key = "rate_limit:" + ip;
        
        Long currentRequests = redisTemplate.opsForValue().increment(key, 1);
        
        if (currentRequests != null && currentRequests == 1) {
            redisTemplate.expire(key, 1, TimeUnit.MINUTES);
        }
        
        if (currentRequests != null && currentRequests <= MAX_REQUESTS_PER_MINUTE) {
            long remaining = MAX_REQUESTS_PER_MINUTE - currentRequests;
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(remaining));
            filterChain.doFilter(request, response);
        } else {
            Long expireTime = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            long waitForRefill = expireTime != null && expireTime > 0 ? expireTime : 60;
            
            response.setHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Too Many Requests\", \"message\": \"Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau " + waitForRefill + " giây nữa.\"}");
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(request.getRemoteAddr())) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
