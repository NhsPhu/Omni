package com.omni.backend.notification.adapter.web;

import com.omni.backend.notification.adapter.persistence.entity.NewsletterSubscriberJpaEntity;
import com.omni.backend.notification.adapter.persistence.repository.NewsletterSubscriberRepository;
import com.omni.backend.notification.application.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
public class NewsletterController {

    private final EmailService emailService;
    private final NewsletterSubscriberRepository subscriberRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        if (subscriberRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được đăng ký từ trước."));
        }

        NewsletterSubscriberJpaEntity subscriber = NewsletterSubscriberJpaEntity.builder()
                .email(email)
                .build();
        subscriberRepository.save(subscriber);

        try {
            String title = "Chào mừng bạn đến với Omni Marketplace!";
            String body = "Cảm ơn bạn đã đăng ký nhận bản tin từ Omni Marketplace.\n\n" +
                          "Chúng tôi sẽ cập nhật cho bạn những chương trình ưu đãi, flash sale và voucher mới nhất hàng tuần!\n\n" +
                          "Trân trọng,\nĐội ngũ Omni.";
            emailService.sendSimpleEmail(email, title, body);
            
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công! Vui lòng kiểm tra email của bạn."));
        } catch (Exception e) {
            // Email configuration might be missing, but we still saved the subscriber
            return ResponseEntity.ok(Map.of("message", "Đăng ký nhận tin thành công! (Chưa thể gửi email xác nhận do chưa cấu hình SMTP)"));
        }
    }
}
