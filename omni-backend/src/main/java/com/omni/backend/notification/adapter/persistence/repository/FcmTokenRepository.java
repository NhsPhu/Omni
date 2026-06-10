package com.omni.backend.notification.adapter.persistence.repository;

import com.omni.backend.notification.adapter.persistence.entity.FcmTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmTokenJpaEntity, UUID> {
    List<FcmTokenJpaEntity> findByUserId(UUID userId);
    Optional<FcmTokenJpaEntity> findByToken(String token);
    void deleteByToken(String token);
}
