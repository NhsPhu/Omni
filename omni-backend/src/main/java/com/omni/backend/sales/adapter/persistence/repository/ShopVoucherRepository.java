package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.ShopVoucherJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShopVoucherRepository extends JpaRepository<ShopVoucherJpaEntity, UUID> {
    List<ShopVoucherJpaEntity> findByShopId(UUID shopId);
}
