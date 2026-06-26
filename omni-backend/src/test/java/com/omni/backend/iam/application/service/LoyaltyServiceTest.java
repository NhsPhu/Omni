package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyPointTransactionJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyPointTransactionRepository;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.domain.event.OrderCompletedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
@DisplayName("LoyaltyService Tests")
class LoyaltyServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoyaltyTierRepository loyaltyTierRepository;

    @Mock
    private LoyaltyPointTransactionRepository transactionRepository;

    @InjectMocks
    private LoyaltyService loyaltyService;

    private final UUID userId = UUID.randomUUID();
    private final UUID orderId = UUID.randomUUID();

    private UserJpaEntity testUser;
    private LoyaltyTierJpaEntity bronzeTier;
    private LoyaltyTierJpaEntity silverTier;
    private LoyaltyTierJpaEntity goldTier;

    @BeforeEach
    void setUp() {
        testUser = UserJpaEntity.builder()
                .id(userId)
                .email("user@example.com")
                .loyaltyPoints(500)
                .loyaltyTier("BRONZE")
                .build();

        bronzeTier = new LoyaltyTierJpaEntity();
        bronzeTier.setName("BRONZE");
        bronzeTier.setMinPoints(0);

        silverTier = new LoyaltyTierJpaEntity();
        silverTier.setName("SILVER");
        silverTier.setMinPoints(500);

        goldTier = new LoyaltyTierJpaEntity();
        goldTier.setName("GOLD");
        goldTier.setMinPoints(2000);
    }

    @Nested
    @DisplayName("awardPoints() - Tích điểm")
    class AwardPointsTests {

        @Test
        @DisplayName("✅ Tích điểm thành công, điểm cộng đúng")
        void awardPoints_Success_PointsUpdated() {
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(testUser));
            when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(List.of(goldTier, silverTier, bronzeTier));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            loyaltyService.awardPoints(userId, 200, "EARN_FROM_ORDER", orderId, "Test award");

            assertEquals(700, testUser.getLoyaltyPoints());
            verify(transactionRepository).save(any(LoyaltyPointTransactionJpaEntity.class));
        }

        @Test
        @DisplayName("✅ Tự động nâng hạng lên SILVER khi đủ điểm")
        void awardPoints_TierUpgrade_BronzeToSilver() {
            testUser.setLoyaltyPoints(400); // Cộng 100 => 500 (đủ SILVER)
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(testUser));
            when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(List.of(goldTier, silverTier, bronzeTier));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            loyaltyService.awardPoints(userId, 100, "EARN_FROM_ORDER", orderId, "Award");

            assertEquals(500, testUser.getLoyaltyPoints());
            assertEquals("SILVER", testUser.getLoyaltyTier());
        }

        @Test
        @DisplayName("✅ Không thay đổi điểm khi points = 0")
        void awardPoints_ZeroPoints_NoChange() {
            loyaltyService.awardPoints(userId, 0, "EARN_FROM_ORDER", orderId, "Zero award");

            verifyNoInteractions(userRepository, transactionRepository);
        }

        @Test
        @DisplayName("✅ Không thay đổi điểm khi points < 0")
        void awardPoints_NegativePoints_NoChange() {
            loyaltyService.awardPoints(userId, -50, "EARN_FROM_ORDER", orderId, "Negative");

            verifyNoInteractions(userRepository, transactionRepository);
        }

        @Test
        @DisplayName("❌ Lỗi nếu user không tồn tại")
        void awardPoints_UserNotFound_ThrowsException() {
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.empty());

            assertThrows(IllegalArgumentException.class,
                    () -> loyaltyService.awardPoints(userId, 100, "EARN", orderId, "desc"));
        }
    }

    @Nested
    @DisplayName("spendPoints() - Tiêu điểm")
    class SpendPointsTests {

        @Test
        @DisplayName("✅ Tiêu điểm thành công, điểm trừ đúng")
        void spendPoints_Success_PointsDeducted() {
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            loyaltyService.spendPoints(userId, 200, "REDEEM", orderId, "Spend test");

            assertEquals(300, testUser.getLoyaltyPoints());
            verify(transactionRepository).save(argThat(tx -> tx.getPoints() == -200));
        }

        @Test
        @DisplayName("❌ Lỗi nếu không đủ điểm để tiêu")
        void spendPoints_NotEnough_ThrowsException() {
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.of(testUser));

            assertThrows(IllegalStateException.class,
                    () -> loyaltyService.spendPoints(userId, 1000, "REDEEM", orderId, "Over spend"));
        }

        @Test
        @DisplayName("✅ Không tiêu điểm nếu points = 0")
        void spendPoints_ZeroPoints_NoChange() {
            loyaltyService.spendPoints(userId, 0, "REDEEM", orderId, "Zero spend");

            verifyNoInteractions(userRepository);
        }

        @Test
        @DisplayName("❌ Lỗi nếu user không tồn tại")
        void spendPoints_UserNotFound_ThrowsException() {
            when(userRepository.findByIdForUpdate(userId)).thenReturn(Optional.empty());

            assertThrows(IllegalArgumentException.class,
                    () -> loyaltyService.spendPoints(userId, 100, "REDEEM", orderId, "desc"));
        }
    }

    @Nested
    @DisplayName("handleOrderCompleted() - Tự động tích điểm khi hoàn đơn")
    class HandleOrderCompletedTests {

        @Test
        @DisplayName("✅ Tích điểm đúng: 1 điểm mỗi 10,000 VND")
        void handleOrderCompleted_CorrectPointCalculation() {
            OrderCompletedEvent event = new OrderCompletedEvent(orderId, userId, new BigDecimal("250000"));

            when(userRepository.findByIdForUpdate(any(UUID.class))).thenReturn(Optional.of(testUser));
            when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(List.of(goldTier, silverTier, bronzeTier));
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            loyaltyService.handleOrderCompleted(event);

            // 250000 / 10000 = 25 points
            assertEquals(525, testUser.getLoyaltyPoints());
        }

        @Test
        @DisplayName("✅ Không tích điểm nếu tổng đơn = 0")
        void handleOrderCompleted_ZeroAmount_NoPoints() {
            OrderCompletedEvent event = new OrderCompletedEvent(orderId, userId, BigDecimal.ZERO);

            loyaltyService.handleOrderCompleted(event);

            verify(userRepository, never()).findByIdForUpdate(any());
        }
    }
}
