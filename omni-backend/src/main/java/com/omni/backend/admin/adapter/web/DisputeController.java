package com.omni.backend.admin.adapter.web;

import com.omni.backend.admin.adapter.persistence.entity.DisputeJpaEntity;
import com.omni.backend.admin.adapter.persistence.repository.DisputeRepository;
import com.omni.backend.admin.application.service.DisputeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;
    private final DisputeRepository disputeRepository;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("/me/disputes")
    public ResponseEntity<DisputeJpaEntity> raiseDispute(
            Authentication authentication,
            @RequestBody RaiseDisputeRequest request) {
        DisputeJpaEntity dispute = disputeService.raiseDispute(
                getUserId(authentication), request.getOrderId(), request.getReason(), request.getEvidenceUrls()
        );
        return ResponseEntity.ok(dispute);
    }

    @GetMapping("/admin/disputes/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DisputeJpaEntity>> getPendingDisputes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(disputeRepository.findByStatus("OPEN", PageRequest.of(page, size)));
    }

    @PatchMapping("/admin/disputes/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DisputeJpaEntity> resolveDispute(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody ResolveDisputeRequest request) {
        DisputeJpaEntity dispute = disputeService.resolveDispute(
                getUserId(authentication), id, request.isCustomerWins(), request.getRefundAmount(), request.getDecision()
        );
        return ResponseEntity.ok(dispute);
    }
}

@Data
class RaiseDisputeRequest {
    private UUID orderId;
    private String reason;
    private String evidenceUrls;
}

@Data
class ResolveDisputeRequest {
    private boolean customerWins;
    private BigDecimal refundAmount;
    private String decision;
}
