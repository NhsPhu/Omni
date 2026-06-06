package com.omni.backend.notification.adapter.persistence.repository;

import com.omni.backend.notification.adapter.persistence.entity.NotificationJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationJpaEntity, UUID> {
    Page<NotificationJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE NotificationJpaEntity n SET n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllAsRead(@Param("userId") UUID userId);
    
    long countByUserIdAndReadAtIsNull(UUID userId);
}
