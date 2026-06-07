package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.LoyaltyPointTransactionJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.LoyaltyTierJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyPointTransactionRepository;
import com.omni.backend.iam.adapter.persistence.repository.LoyaltyTierRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.domain.event.OrderCompletedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LoyaltyServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoyaltyTierRepository loyaltyTierRepository;

    @Mock
    private LoyaltyPointTransactionRepository transactionRepository;

    @InjectMocks
    private LoyaltyService loyaltyService;

    private UserJpaEntity testUser;
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = new UserJpaEntity();
        testUser.setId(testUserId);
        testUser.setLoyaltyPoints(500);
        testUser.setLoyaltyTier("SILVER");
    }

    @Test
    void testAwardPoints_Success() {
        // Arrange
        UUID refId = UUID.randomUUID();
        when(userRepository.findByIdForUpdate(testUserId)).thenReturn(Optional.of(testUser));
        when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(Arrays.asList(
                LoyaltyTierJpaEntity.builder().name("GOLD").minPoints(1000).build(),
                LoyaltyTierJpaEntity.builder().name("SILVER").minPoints(0).build()
        ));

        // Act
        loyaltyService.awardPoints(testUserId, 200, "BONUS", refId, "Test bonus");

        // Assert
        assertEquals(700, testUser.getLoyaltyPoints());
        assertEquals("SILVER", testUser.getLoyaltyTier());
        
        verify(userRepository, times(1)).save(testUser);
        
        ArgumentCaptor<LoyaltyPointTransactionJpaEntity> txCaptor = ArgumentCaptor.forClass(LoyaltyPointTransactionJpaEntity.class);
        verify(transactionRepository, times(1)).save(txCaptor.capture());
        
        LoyaltyPointTransactionJpaEntity tx = txCaptor.getValue();
        assertEquals(200, tx.getPoints());
        assertEquals("BONUS", tx.getType());
        assertEquals(testUserId, tx.getUserId());
    }

    @Test
    void testAwardPoints_UpgradeTier() {
        // Arrange
        when(userRepository.findByIdForUpdate(testUserId)).thenReturn(Optional.of(testUser));
        when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(Arrays.asList(
                LoyaltyTierJpaEntity.builder().name("DIAMOND").minPoints(5000).build(),
                LoyaltyTierJpaEntity.builder().name("GOLD").minPoints(1000).build(),
                LoyaltyTierJpaEntity.builder().name("SILVER").minPoints(0).build()
        ));

        // Act
        loyaltyService.awardPoints(testUserId, 600, "PURCHASE", UUID.randomUUID(), "Order 123");

        // Assert
        assertEquals(1100, testUser.getLoyaltyPoints());
        assertEquals("GOLD", testUser.getLoyaltyTier()); // Upgraded!
    }

    @Test
    void testSpendPoints_Success() {
        // Arrange
        when(userRepository.findByIdForUpdate(testUserId)).thenReturn(Optional.of(testUser));

        // Act
        loyaltyService.spendPoints(testUserId, 300, "REDEEM", UUID.randomUUID(), "Redeem voucher");

        // Assert
        assertEquals(200, testUser.getLoyaltyPoints());
        verify(userRepository, times(1)).save(testUser);
        
        ArgumentCaptor<LoyaltyPointTransactionJpaEntity> txCaptor = ArgumentCaptor.forClass(LoyaltyPointTransactionJpaEntity.class);
        verify(transactionRepository, times(1)).save(txCaptor.capture());
        assertEquals(-300, txCaptor.getValue().getPoints());
    }

    @Test
    void testSpendPoints_NotEnoughPoints() {
        // Arrange
        when(userRepository.findByIdForUpdate(testUserId)).thenReturn(Optional.of(testUser));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            loyaltyService.spendPoints(testUserId, 1000, "REDEEM", UUID.randomUUID(), "Redeem big voucher");
        });
        
        assertEquals("Not enough loyalty points", exception.getMessage());
        verify(userRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void testHandleOrderCompleted() {
        // Arrange
        UUID orderId = UUID.randomUUID();
        OrderCompletedEvent event = new OrderCompletedEvent(testUserId, orderId, new BigDecimal("150000")); // 150k VND = 15 points
        
        when(userRepository.findByIdForUpdate(testUserId)).thenReturn(Optional.of(testUser));
        when(loyaltyTierRepository.findAll(any(Sort.class))).thenReturn(Arrays.asList(
                LoyaltyTierJpaEntity.builder().name("SILVER").minPoints(0).build()
        ));

        // Act
        loyaltyService.handleOrderCompleted(event);

        // Assert
        assertEquals(515, testUser.getLoyaltyPoints());
        
        ArgumentCaptor<LoyaltyPointTransactionJpaEntity> txCaptor = ArgumentCaptor.forClass(LoyaltyPointTransactionJpaEntity.class);
        verify(transactionRepository, times(1)).save(txCaptor.capture());
        assertEquals(15, txCaptor.getValue().getPoints());
        assertEquals("EARN_FROM_ORDER", txCaptor.getValue().getType());
    }
}
