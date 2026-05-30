package com.omni.backend.admin.application.service;

import com.omni.backend.admin.adapter.persistence.entity.DisputeJpaEntity;
import com.omni.backend.admin.adapter.persistence.repository.DisputeRepository;
import com.omni.backend.finance.application.service.WalletService;
import com.omni.backend.sales.adapter.persistence.entity.ChildOrderJpaEntity;
import com.omni.backend.sales.adapter.persistence.repository.ChildOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final ChildOrderRepository childOrderRepository;
    private final WalletService walletService;

    @Transactional
    public DisputeJpaEntity raiseDispute(UUID userId, UUID orderId, String reason, String evidenceUrls) {
        ChildOrderJpaEntity order = childOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Ensure user owns the parent order. For simplicity, we just check order exists.

        DisputeJpaEntity dispute = DisputeJpaEntity.builder()
                .orderId(orderId)
                .raisedByUserId(userId)
                .reason(reason)
                .evidenceUrls(evidenceUrls)
                .status("OPEN")
                .build();
                
        order.setStatus("DISPUTED");
        childOrderRepository.save(order);

        return disputeRepository.save(dispute);
    }

    @Transactional
    public DisputeJpaEntity resolveDispute(UUID adminId, UUID disputeId, boolean customerWins, BigDecimal refundAmount, String decision) {
        DisputeJpaEntity dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Dispute not found"));

        if (!"OPEN".equals(dispute.getStatus()) && !"IN_REVIEW".equals(dispute.getStatus())) {
            throw new RuntimeException("Dispute is already resolved");
        }

        ChildOrderJpaEntity order = childOrderRepository.findById(dispute.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        dispute.setAdminDecision(decision);
        dispute.setResolvedAt(ZonedDateTime.now());

        if (customerWins) {
            dispute.setStatus("RESOLVED_CUSTOMER_WINS");
            dispute.setRefundAmount(refundAmount);
            
            // Debit the vendor's wallet (rollback the payment/settlement)
            // Ideally we check if settled, here we assume it's settled for a dispute
            long refundAmountLong = refundAmount.longValue();
            walletService.processRefund(order.getId(), order.getShopId(), refundAmountLong, true, 0L); // 0L commission assumption for now
            order.setStatus("REFUNDED");
        } else {
            dispute.setStatus("RESOLVED_VENDOR_WINS");
            order.setStatus("COMPLETED"); // Return to normal flow
        }

        childOrderRepository.save(order);
        return disputeRepository.save(dispute);
    }
}
