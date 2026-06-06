package com.omni.backend.chat.adapter.persistence.repository;

import com.omni.backend.chat.adapter.persistence.entity.ChatRoomJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomJpaEntity, UUID> {
    
    Optional<ChatRoomJpaEntity> findByUserIdAndShopId(UUID userId, UUID shopId);

    Page<ChatRoomJpaEntity> findByUserIdOrderByLastMessageAtDesc(UUID userId, Pageable pageable);

    Page<ChatRoomJpaEntity> findByShopIdOrderByLastMessageAtDesc(UUID shopId, Pageable pageable);
}
