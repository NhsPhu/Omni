package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.WithdrawalRequestJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequestJpaEntity, UUID> {
}
