package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.application.service.VnpayService;
import com.omni.backend.finance.application.service.WebhookService;
import com.omni.backend.finance.domain.event.OrderPaidEvent;
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
    private final WebhookService webhookService;
    private final ApplicationEventPublisher eventPublisher;

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
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_TransactionNo = params.get("vnp_TransactionNo"); // Use this as idempotency key

        if ("00".equals(vnp_ResponseCode)) {
            // Thanh toán thành công
            boolean processed = webhookService.processIdempotentEvent("VNPAY", vnp_TransactionNo, params, () -> {
                UUID orderId = UUID.fromString(vnp_TxnRef);
                ParentOrderJpaEntity order = parentOrderRepository.findById(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));
                        
                order.setStatus("PAID"); // Mark order as paid
                parentOrderRepository.save(order);
                log.info("Order {} marked as PAID via VNPay callback", orderId);
                
                eventPublisher.publishEvent(new OrderPaidEvent(order.getId(), order.getUserId()));
            });
            
            if (!processed) {
                log.info("VNPay callback for tx {} already processed", vnp_TransactionNo);
            }
            
            return ResponseEntity.ok("Success");
        } else {
            return ResponseEntity.badRequest().body("Payment failed with code " + vnp_ResponseCode);
        }
    }
}
