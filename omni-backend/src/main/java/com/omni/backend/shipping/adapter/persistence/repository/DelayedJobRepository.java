package com.omni.backend.shipping.adapter.persistence.repository;

import com.omni.backend.shipping.adapter.persistence.entity.DelayedJobJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DelayedJobRepository extends JpaRepository<DelayedJobJpaEntity, UUID> {
    
    @Modifying
    @Query(value = "UPDATE delayed_jobs SET status = 'CANCELLED' WHERE payload->>'shopOrderId' = :shopOrderId", nativeQuery = true)
    void cancelJobByShopOrderId(String shopOrderId);
}
