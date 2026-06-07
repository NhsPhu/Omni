package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyTierRepository extends JpaRepository<LoyaltyTierJpaEntity, String> {
}
