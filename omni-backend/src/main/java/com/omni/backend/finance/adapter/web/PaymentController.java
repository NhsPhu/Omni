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

    @org.springframework.beans.factory.annotation.Value("${app.storefront-url:http://localhost:3000}")
    private String storeFrontUrl;

    @PostMapping("/vnpay/create-url")
    public ResponseEntity<String> createVnpayUrl(@RequestParam UUID orderId, HttpServletRequest request) {
        ParentOrderJpaEntity order = parentOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        String ipAddress = request.getRemoteAddr();
        String url = vnpayService.createPaymentUrl(order.getId(), order.getFinalAmount(), ipAddress);
        
        return ResponseEntity.ok(url);
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<Void> vnpayCallback(@RequestParam Map<String, String> params) {
        vnpayService.processIpnCallback(params);
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTxnRef = params.get("vnp_TxnRef");
        
        // In production, this should be VITE_STOREFRONT_URL or similar from config.
        String redirectUrl = storeFrontUrl + "/payment/callback?vnp_ResponseCode=" + vnpResponseCode + "&vnp_TxnRef=" + vnpTxnRef;
        return ResponseEntity.status(302).header("Location", redirectUrl).build();
    }

    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {
        String code = vnpayService.processIpnCallback(params);
        if ("00".equals(code)) {
            return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
        } else {
            return ResponseEntity.ok("{\"RspCode\":\"" + code + "\",\"Message\":\"Error\"}");
        }
    }
}
