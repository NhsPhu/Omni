package com.omni.backend.aichat.adapter.persistence.repository;

import com.omni.backend.aichat.adapter.persistence.entity.AiChatSessionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiChatSessionRepository extends JpaRepository<AiChatSessionJpaEntity, UUID> {
    Optional<AiChatSessionJpaEntity> findByUserIdAndShopIdAndStatus(UUID userId, UUID shopId, String status);
    List<AiChatSessionJpaEntity> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
