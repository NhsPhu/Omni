package com.omni.backend.chat.application.service;

import com.omni.backend.chat.adapter.persistence.entity.ChatMessageJpaEntity;
import com.omni.backend.chat.adapter.persistence.entity.ChatRoomJpaEntity;
import com.omni.backend.chat.adapter.persistence.repository.ChatMessageRepository;
import com.omni.backend.chat.adapter.persistence.repository.ChatRoomRepository;
import com.omni.backend.chat.application.dto.ChatMessageDto;
import com.omni.backend.chat.application.dto.ChatRoomDto;
import com.omni.backend.iam.adapter.persistence.entity.ShopJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.ShopRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    @Transactional
    public ChatRoomDto getOrCreateRoom(UUID userId, UUID shopId) {
        ChatRoomJpaEntity room = chatRoomRepository.findByUserIdAndShopId(userId, shopId)
                .orElseGet(() -> {
                    ChatRoomJpaEntity newRoom = ChatRoomJpaEntity.builder()
                            .userId(userId)
                            .shopId(shopId)
                            .lastMessageAt(ZonedDateTime.now())
                            .build();
                    return chatRoomRepository.save(newRoom);
                });
        return mapToDto(room, "USER"); // By default, returning context for user, or it doesn't matter here
    }

    @Transactional(readOnly = true)
    public Page<ChatRoomDto> getUserRooms(UUID userId, int page, int size) {
        return chatRoomRepository.findByUserIdOrderByLastMessageAtDesc(userId, PageRequest.of(page, size))
                .map(room -> mapToDto(room, "USER"));
    }

    @Transactional(readOnly = true)
    public Page<ChatRoomDto> getShopRooms(UUID shopId, int page, int size) {
        return chatRoomRepository.findByShopIdOrderByLastMessageAtDesc(shopId, PageRequest.of(page, size))
                .map(room -> mapToDto(room, "SHOP"));
    }

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getMessages(UUID roomId, int page, int size) {
        // Fetch ordered by createdAt desc to get latest first, but frontend usually reverses
        return chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size))
                .map(msg -> ChatMessageDto.builder()
                        .id(msg.getId())
                        .roomId(msg.getRoomId())
                        .senderId(msg.getSenderId())
                        .senderType(msg.getSenderType())
                        .content(msg.getContent())
                        .isRead(msg.getIsRead())
                        .createdAt(msg.getCreatedAt())
                        .build());
    }

    @Transactional
    public ChatMessageDto saveMessage(UUID roomId, UUID senderId, String senderType, String content) {
        ChatRoomJpaEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        ChatMessageJpaEntity message = ChatMessageJpaEntity.builder()
                .roomId(roomId)
                .senderId(senderId)
                .senderType(senderType)
                .content(content)
                .build();
        message = chatMessageRepository.save(message);
        
        ZonedDateTime msgTime = message.getCreatedAt() != null ? message.getCreatedAt() : ZonedDateTime.now();

        room.setLastMessage(content);
        room.setLastMessageAt(msgTime);
        chatRoomRepository.save(room);

        return ChatMessageDto.builder()
                .id(message.getId())
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .senderType(message.getSenderType())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(msgTime)
                .build();
    }

    @Transactional
    public void markMessagesAsRead(UUID roomId, String readerType) {
        // If reader is USER, mark messages sent by SHOP as read
        String targetSenderType = "USER".equals(readerType) ? "SHOP" : "USER";
        chatMessageRepository.markMessagesAsRead(roomId, targetSenderType);
    }

    private ChatRoomDto mapToDto(ChatRoomJpaEntity room, String context) {
        UserJpaEntity user = userRepository.findById(room.getUserId()).orElse(null);
        ShopJpaEntity shop = shopRepository.findById(room.getShopId()).orElse(null);
        
        String userName = user != null ? user.getFullName() : "Unknown User";
        String userAvatar = user != null ? user.getAvatarUrl() : null;
        
        String shopName = shop != null ? shop.getName() : "Unknown Shop";
        String shopAvatar = shop != null ? shop.getLogoUrl() : null;
        
        // Count unread messages. If context is USER, count messages sent by SHOP that are unread
        String targetSenderType = "USER".equals(context) ? "SHOP" : "USER";
        Integer unreadCount = chatMessageRepository.countByRoomIdAndSenderTypeAndIsReadFalse(room.getId(), targetSenderType);

        return ChatRoomDto.builder()
                .id(room.getId())
                .userId(room.getUserId())
                .shopId(room.getShopId())
                .userName(userName)
                .userAvatar(userAvatar)
                .shopName(shopName)
                .shopAvatar(shopAvatar)
                .lastMessage(room.getLastMessage())
                .lastMessageAt(room.getLastMessageAt())
                .unreadCount(unreadCount)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
