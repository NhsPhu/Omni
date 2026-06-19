package com.omni.backend.aichat.adapter.persistence.repository;

import com.omni.backend.aichat.adapter.persistence.entity.AiChatMessageJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessageJpaEntity, UUID> {
    List<AiChatMessageJpaEntity> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
