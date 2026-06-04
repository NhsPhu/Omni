package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.FlashSaleEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleEventRepository extends JpaRepository<FlashSaleEventJpaEntity, UUID> {

    List<FlashSaleEventJpaEntity> findByStatus(String status);

    List<FlashSaleEventJpaEntity> findByStatusIn(List<String> statuses);

    Optional<FlashSaleEventJpaEntity> findFirstByStatusOrderByStartTimeAsc(String status);

    List<FlashSaleEventJpaEntity> findByStartTimeBeforeAndStatusIn(ZonedDateTime time, List<String> statuses);

    List<FlashSaleEventJpaEntity> findByEndTimeBeforeAndStatus(ZonedDateTime time, String status);

    List<FlashSaleEventJpaEntity> findAllByOrderByCreatedAtDesc();
}
