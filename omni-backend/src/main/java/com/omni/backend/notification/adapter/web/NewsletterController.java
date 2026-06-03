package com.omni.backend.notification.adapter.web;

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

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        try {
            String title = "Chào mừng bạn đến với Omni Marketplace!";
            String body = "Cảm ơn bạn đã đăng ký nhận bản tin từ Omni Marketplace.\n\n" +
                          "Chúng tôi sẽ cập nhật cho bạn những chương trình ưu đãi, flash sale và voucher mới nhất hàng tuần!\n\n" +
                          "Trân trọng,\nĐội ngũ Omni.";
            emailService.sendSimpleEmail(email, title, body);
            
            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công! Vui lòng kiểm tra email của bạn."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Không thể gửi email. Vui lòng thử lại sau."));
        }
    }
}
