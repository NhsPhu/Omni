package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.ShopAnalyticsDailyJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopAnalyticsDailyRepository extends JpaRepository<ShopAnalyticsDailyJpaEntity, UUID> {
    Optional<ShopAnalyticsDailyJpaEntity> findByShopIdAndDate(UUID shopId, LocalDate date);
}
