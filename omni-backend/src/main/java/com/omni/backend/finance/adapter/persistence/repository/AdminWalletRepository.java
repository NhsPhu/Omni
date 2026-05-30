package com.omni.backend.finance.adapter.persistence.repository;

import com.omni.backend.finance.adapter.persistence.entity.AdminWalletJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AdminWalletRepository extends JpaRepository<AdminWalletJpaEntity, UUID> {
}
