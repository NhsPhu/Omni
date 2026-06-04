package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.FlashSaleItemJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItemJpaEntity, UUID> {

    List<FlashSaleItemJpaEntity> findByEventId(UUID eventId);

    List<FlashSaleItemJpaEntity> findByEventIdAndStatus(UUID eventId, String status);

    List<FlashSaleItemJpaEntity> findByEventIdAndShopId(UUID eventId, UUID shopId);

    Optional<FlashSaleItemJpaEntity> findByEventIdAndProductIdAndSkuId(UUID eventId, UUID productId, UUID skuId);

    long countByEventId(UUID eventId);

    long countByEventIdAndStatus(UUID eventId, String status);

    /**
     * Atomic increment sold_count — prevents overselling.
     * Returns number of rows updated (1 = success, 0 = out of stock).
     */
    @Modifying
    @Query("UPDATE FlashSaleItemJpaEntity i SET i.soldCount = i.soldCount + :qty WHERE i.id = :id AND (i.soldCount + :qty) <= i.flashStock")
    int incrementSoldCount(@Param("id") UUID id, @Param("qty") int qty);
}
