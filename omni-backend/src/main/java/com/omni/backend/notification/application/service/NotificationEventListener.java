package com.omni.backend.notification.application.service;

import com.omni.backend.finance.domain.event.OrderPaidEvent;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.sales.domain.event.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import com.omni.backend.shared.config.RabbitMQConfig;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@RabbitListener(queues = RabbitMQConfig.QUEUE_NOTIFICATION)
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @RabbitHandler
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
            String buyerName = user.getFullName() != null ? user.getFullName() : "Khách hàng";
            Map<String, Object> vars = Map.of(
                "buyerName", buyerName,
                "orderCode", event.getParentOrderId().toString().substring(0, 8).toUpperCase(),
                "statusMessage", message
            );
            emailService.sendEmailWithTemplate(user.getEmail(), title, "email/order-status-update", vars);
        }
    }

    @RabbitHandler
    public void handleOrderPaidEvent(OrderPaidEvent event) {
        log.info("Received OrderPaidEvent for order: {}", event.getParentOrderId());
        
        String title = "Thanh toán thành công";
        String message = "Đơn hàng " + event.getParentOrderId().toString().substring(0,8).toUpperCase() + " của bạn đã được thanh toán thành công qua VNPay!";
        String payload = "{\"orderId\": \"" + event.getParentOrderId() + "\"}";

        // 1. Gửi In-app Notification
        notificationService.sendSystemNotification(event.getUserId(), title, message, payload);

        // 2. Gửi Email (nếu tìm thấy User)
        Optional<UserJpaEntity> userOpt = userRepository.findById(event.getUserId());
        if (userOpt.isPresent()) {
            UserJpaEntity user = userOpt.get();
            String buyerName = user.getFullName() != null ? user.getFullName() : "Khách hàng";
            Map<String, Object> vars = Map.of(
                "buyerName", buyerName,
                "orderCode", event.getParentOrderId().toString().substring(0, 8).toUpperCase(),
                "statusMessage", message
            );
            emailService.sendEmailWithTemplate(user.getEmail(), title, "email/order-status-update", vars);
        }
    }

    @RabbitHandler
    public void handleOrderCompletedEvent(com.omni.backend.notification.application.event.OrderCompletedEvent event) {
        log.info("Received OrderCompletedEvent for shop order: {}", event.getShopOrderId());
        
        // Gửi thông báo cho Customer
        Optional<UserJpaEntity> customerOpt = userRepository.findById(event.getCustomerId());
        if (customerOpt.isPresent()) {
            UserJpaEntity customer = customerOpt.get();
            String title = "Đơn hàng hoàn thành";
            String message = "Đơn hàng " + event.getShopOrderId().toString().substring(0,8).toUpperCase() + " đã giao thành công và hoàn tất!";
            notificationService.sendSystemNotification(event.getCustomerId(), title, message, "{\"shopOrderId\": \"" + event.getShopOrderId() + "\"}");

            String buyerName = customer.getFullName() != null ? customer.getFullName() : "Khách hàng";
            Map<String, Object> vars = Map.of(
                "buyerName", buyerName,
                "orderCode", event.getShopOrderId().toString().substring(0, 8).toUpperCase(),
                "statusMessage", message
            );
            emailService.sendEmailWithTemplate(customer.getEmail(), title, "email/order-status-update", vars);
        }
    }
}
