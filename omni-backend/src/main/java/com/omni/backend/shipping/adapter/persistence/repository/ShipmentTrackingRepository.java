package com.omni.backend.shipping.adapter.persistence.repository;

import com.omni.backend.shipping.adapter.persistence.entity.ShipmentTrackingJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTrackingJpaEntity, UUID> {
    List<ShipmentTrackingJpaEntity> findByTrackingCodeOrderByOccurredAtAsc(String trackingCode);
    boolean existsByTrackingCodeAndGhnStatus(String trackingCode, String ghnStatus);
}
