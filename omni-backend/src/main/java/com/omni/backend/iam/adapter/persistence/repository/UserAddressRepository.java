package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.UserAddressJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddressJpaEntity, UUID> {
    List<UserAddressJpaEntity> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    Optional<UserAddressJpaEntity> findByIdAndUserId(UUID id, UUID userId);
    List<UserAddressJpaEntity> findByUserIdAndIsDefaultTrue(UUID userId);
}
