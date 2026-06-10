package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyPointTransactionJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyPointTransactionRepository;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.domain.event.OrderCompletedEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import com.omni.backend.shared.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@RabbitListener(queues = RabbitMQConfig.QUEUE_LOYALTY)
public class LoyaltyService {

    private final UserRepository userRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final LoyaltyPointTransactionRepository transactionRepository;

    @Transactional
    public void awardPoints(UUID userId, int points, String type, UUID referenceId, String description) {
        if (points <= 0) return;
        
        UserJpaEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        
        // Re-evaluate tier
        List<LoyaltyTierJpaEntity> tiers = loyaltyTierRepository.findAll(Sort.by(Sort.Direction.DESC, "minPoints"));
        for (LoyaltyTierJpaEntity tier : tiers) {
            if (user.getLoyaltyPoints() >= tier.getMinPoints()) {
                if (!tier.getName().equals(user.getLoyaltyTier())) {
                    user.setLoyaltyTier(tier.getName());
                    log.info("User {} upgraded to tier {}", userId, tier.getName());
                }
                break;
            }
        }
        
        userRepository.save(user);

        LoyaltyPointTransactionJpaEntity tx = LoyaltyPointTransactionJpaEntity.builder()
                .userId(userId)
                .points(points)
                .type(type)
                .referenceId(referenceId)
                .description(description)
                .build();
        transactionRepository.save(tx);
        
        log.info("Awarded {} points to user {} for {}", points, userId, type);
    }

    @Transactional
    public void spendPoints(UUID userId, int points, String type, UUID referenceId, String description) {
        if (points <= 0) return;

        UserJpaEntity user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getLoyaltyPoints() < points) {
            throw new IllegalStateException("Not enough loyalty points");
        }

        user.setLoyaltyPoints(user.getLoyaltyPoints() - points);
        userRepository.save(user);

        LoyaltyPointTransactionJpaEntity tx = LoyaltyPointTransactionJpaEntity.builder()
                .userId(userId)
                .points(-points)
                .type(type)
                .referenceId(referenceId)
                .description(description)
                .build();
        transactionRepository.save(tx);

        log.info("User {} spent {} points for {}", userId, points, type);
    }

    @Transactional(readOnly = true)
    public List<LoyaltyPointTransactionJpaEntity> getTransactionHistory(UUID userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @RabbitHandler
    public void handleOrderCompleted(OrderCompletedEvent event) {
        // Calculate points: 1 point per 10,000 VND
        int points = event.getTotalAmount().divide(new java.math.BigDecimal("10000"), java.math.RoundingMode.DOWN).intValue();
        awardPoints(event.getUserId(), points, "EARN_FROM_ORDER", event.getOrderId(), "Points earned from completing order " + event.getOrderId());
    }
}
