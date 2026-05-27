package com.omni.backend.iam.adapter.persistence.repository;

import java.util.Optional;
import java.util.UUID;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserJpaEntity, UUID> {
    Optional<UserJpaEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<UserJpaEntity> findByProviderAndProviderId(String provider, String providerId);
}

