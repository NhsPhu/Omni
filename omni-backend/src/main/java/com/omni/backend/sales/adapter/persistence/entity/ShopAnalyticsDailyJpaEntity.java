package com.omni.backend.sales.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "shop_analytics_daily")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopAnalyticsDailyJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "shop_id", nullable = false)
    private UUID shopId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "page_views", nullable = false)
    @Builder.Default
    private Integer pageViews = 0;

    @Column(name = "add_to_carts", nullable = false)
    @Builder.Default
    private Integer addToCarts = 0;

    @Column(name = "checkout_starts", nullable = false)
    @Builder.Default
    private Integer checkoutStarts = 0;

    @Column(name = "orders_placed", nullable = false)
    @Builder.Default
    private Integer ordersPlaced = 0;

    @Column(name = "total_gmv", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalGmv = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
