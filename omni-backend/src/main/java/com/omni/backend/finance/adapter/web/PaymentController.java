package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.application.service.VnpayService;
import com.omni.backend.sales.adapter.persistence.entity.ParentOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ParentOrderRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VnpayService vnpayService;
    private final ParentOrderRepository parentOrderRepository;

    @PostMapping("/vnpay/create-url")
    public ResponseEntity<String> createVnpayUrl(@RequestParam UUID orderId, HttpServletRequest request) {
        ParentOrderJpaEntity order = parentOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        String ipAddress = request.getRemoteAddr();
        String url = vnpayService.createPaymentUrl(order.getId(), order.getFinalAmount(), ipAddress);
        
        return ResponseEntity.ok(url);
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<String> vnpayCallback(@RequestParam Map<String, String> params) {
        String code = vnpayService.processIpnCallback(params);
        if ("00".equals(code)) {
            return ResponseEntity.ok("Success");
        } else {
            return ResponseEntity.badRequest().body("Payment failed with IPN return code " + code);
        }
    }
}
