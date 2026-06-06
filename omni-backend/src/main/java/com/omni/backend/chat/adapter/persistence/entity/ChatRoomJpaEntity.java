package com.omni.backend.chat.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "shop_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "shop_id", nullable = false)
    private UUID shopId;

    @Column(name = "last_message")
    private String lastMessage;

    @Column(name = "last_message_at")
    private ZonedDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
