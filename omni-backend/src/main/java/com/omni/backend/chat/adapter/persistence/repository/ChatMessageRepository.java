package com.omni.backend.chat.adapter.persistence.repository;

import com.omni.backend.chat.adapter.persistence.entity.ChatMessageJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageJpaEntity, UUID> {

    Page<ChatMessageJpaEntity> findByRoomIdOrderByCreatedAtDesc(UUID roomId, Pageable pageable);

    Integer countByRoomIdAndSenderTypeAndIsReadFalse(UUID roomId, String senderType);

    @Modifying
    @Query("UPDATE ChatMessageJpaEntity m SET m.isRead = true WHERE m.roomId = :roomId AND m.senderType = :senderType AND m.isRead = false")
    void markMessagesAsRead(@Param("roomId") UUID roomId, @Param("senderType") String senderType);
}
