package com.omni.backend.finance.adapter.web;

import com.omni.backend.finance.adapter.persistence.entity.WithdrawalRequestJpaEntity;
import com.omni.backend.finance.adapter.persistence.repository.WithdrawalRequestRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/finance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFinanceController {

    private final WithdrawalRequestRepository withdrawalRequestRepository;

    @GetMapping("/withdrawals")
    public ResponseEntity<Page<WithdrawalRequestJpaEntity>> getWithdrawals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(withdrawalRequestRepository.findAll(PageRequest.of(page, size)));
    }

    @PatchMapping("/withdrawals/{id}/approve")
    public ResponseEntity<WithdrawalRequestJpaEntity> approveWithdrawal(
            @PathVariable UUID id,
            @RequestBody ApproveWithdrawalRequest request) {
        WithdrawalRequestJpaEntity withdrawal = withdrawalRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Withdrawal not found"));

        withdrawal.setStatus("COMPLETED");
        withdrawal.setAdminNote(request.getTxId());
        
        withdrawalRequestRepository.save(withdrawal);
        return ResponseEntity.ok(withdrawal);
    }
}

@Data
class ApproveWithdrawalRequest {
    private String txId;
}
