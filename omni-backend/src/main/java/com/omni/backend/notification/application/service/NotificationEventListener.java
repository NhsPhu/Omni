package com.omni.backend.notification.application.service;

import com.omni.backend.finance.domain.event.OrderPaidEvent;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        log.info("Received OrderPlacedEvent for order: {}", event.getParentOrderId());
        
        String title = "Đơn hàng mới được tạo";
        String message = "Đơn hàng " + event.getParentOrderId() + " của bạn đã được đặt thành công!";
        String payload = "{\"orderId\": \"" + event.getParentOrderId() + "\"}";

        // 1. Gửi In-app Notification
        notificationService.sendSystemNotification(event.getUserId(), title, message, payload);

        // 2. Gửi Email (nếu tìm thấy User)
        Optional<UserJpaEntity> userOpt = userRepository.findById(event.getUserId());
        if (userOpt.isPresent()) {
            UserJpaEntity user = userOpt.get();
            String emailText = "Xin chào " + user.getFullName() + ",\n\n" + message + "\n\nCảm ơn bạn đã mua sắm tại Omni!";
            emailService.sendSimpleEmail(user.getEmail(), title, emailText);
        }
    }

    @Async
    @EventListener
    public void handleOrderPaidEvent(OrderPaidEvent event) {
        log.info("Received OrderPaidEvent for order: {}", event.getParentOrderId());
        
        String title = "Thanh toán thành công";
        String message = "Đơn hàng " + event.getParentOrderId() + " của bạn đã được thanh toán thành công qua VNPay!";
        String payload = "{\"orderId\": \"" + event.getParentOrderId() + "\"}";

        // 1. Gửi In-app Notification
        notificationService.sendSystemNotification(event.getUserId(), title, message, payload);

        // 2. Gửi Email (nếu tìm thấy User)
        Optional<UserJpaEntity> userOpt = userRepository.findById(event.getUserId());
        if (userOpt.isPresent()) {
            UserJpaEntity user = userOpt.get();
            String emailText = "Xin chào " + user.getFullName() + ",\n\n" + message + "\n\nĐơn hàng của bạn sẽ sớm được xử lý.";
            emailService.sendSimpleEmail(user.getEmail(), title, emailText);
        }
    }
}
