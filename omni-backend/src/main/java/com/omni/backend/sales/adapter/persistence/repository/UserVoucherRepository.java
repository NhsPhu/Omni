package com.omni.backend.sales.adapter.persistence.repository;

import com.omni.backend.sales.adapter.persistence.entity.UserVoucherJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucherJpaEntity, UUID> {
    List<UserVoucherJpaEntity> findByUserIdAndIsUsedFalse(UUID userId);
    List<UserVoucherJpaEntity> findByUserId(UUID userId);
    Optional<UserVoucherJpaEntity> findByUserIdAndVoucherId(UUID userId, UUID voucherId);
    boolean existsByUserIdAndVoucherId(UUID userId, UUID voucherId);
}
