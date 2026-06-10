package com.omni.backend.shared.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "omni.events.exchange";

    // Queues
    public static final String QUEUE_NOTIFICATION = "omni.notification.queue";
    public static final String QUEUE_LOYALTY = "omni.loyalty.queue";
    public static final String QUEUE_ELASTICSEARCH = "omni.elasticsearch.queue";

    // Routing Keys
    public static final String ROUTING_KEY_ORDER_PLACED = "order.placed";
    public static final String ROUTING_KEY_ORDER_PAID = "order.paid";
    public static final String ROUTING_KEY_ORDER_COMPLETED = "order.completed";
    public static final String ROUTING_KEY_PRODUCT_SYNC = "product.sync";

    @Bean
    public TopicExchange omniExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NOTIFICATION, true);
    }

    @Bean
    public Queue loyaltyQueue() {
        return new Queue(QUEUE_LOYALTY, true);
    }

    @Bean
    public Queue elasticsearchQueue() {
        return new Queue(QUEUE_ELASTICSEARCH, true);
    }

    // Bindings
    @Bean
    public Binding notificationOrderPlacedBinding() {
        return BindingBuilder.bind(notificationQueue()).to(omniExchange()).with(ROUTING_KEY_ORDER_PLACED);
    }

    @Bean
    public Binding notificationOrderPaidBinding() {
        return BindingBuilder.bind(notificationQueue()).to(omniExchange()).with(ROUTING_KEY_ORDER_PAID);
    }

    @Bean
    public Binding notificationOrderCompletedBinding() {
        return BindingBuilder.bind(notificationQueue()).to(omniExchange()).with(ROUTING_KEY_ORDER_COMPLETED);
    }

    @Bean
    public Binding loyaltyOrderCompletedBinding() {
        return BindingBuilder.bind(loyaltyQueue()).to(omniExchange()).with(ROUTING_KEY_ORDER_COMPLETED);
    }
    
    @Bean
    public Binding elasticsearchProductSyncBinding() {
        return BindingBuilder.bind(elasticsearchQueue()).to(omniExchange()).with(ROUTING_KEY_PRODUCT_SYNC);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
