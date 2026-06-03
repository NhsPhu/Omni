package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.RefreshTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenJpaEntity, UUID> {
    Optional<RefreshTokenJpaEntity> findByToken(String token);
    void deleteByUserId(UUID userId);
    void deleteByToken(String token);
}
