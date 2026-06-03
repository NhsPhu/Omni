package com.omni.backend.sales.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "child_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChildOrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_order_id", nullable = false)
    @JsonIgnore
    private ParentOrderJpaEntity parentOrder;

    @Column(name = "shop_id", nullable = false)
    private UUID shopId;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_voucher_id")
    private UUID shopVoucherId;

    @Column(name = "shop_discount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shopDiscount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 50)
    private String status; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED

    @Column(name = "tracking_code", length = 100)
    private String trackingCode;

    @Column(name = "ghn_order_code", length = 100)
    private String ghnOrderCode;

    @Column(name = "shipped_at")
    private ZonedDateTime shippedAt;

    @Column(name = "delivered_at")
    private ZonedDateTime deliveredAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    @Column(name = "cancelled_at")
    private ZonedDateTime cancelledAt;

    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "auto_complete_at")
    private ZonedDateTime autoCompleteAt;

    @Column(name = "return_reason", columnDefinition = "TEXT")
    private String returnReason;

    @ElementCollection
    @CollectionTable(name = "child_order_return_images", joinColumns = @JoinColumn(name = "child_order_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> returnImages = new ArrayList<>();

    @OneToMany(mappedBy = "childOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<OrderItemJpaEntity> items = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
