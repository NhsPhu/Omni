package com.omni.backend.admin.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "disputes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId; // Refers to ChildOrder

    @Column(name = "raised_by_user_id", nullable = false)
    private UUID raisedByUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_urls", columnDefinition = "JSONB")
    private String evidenceUrls;

    @Column(nullable = false, length = 50)
    private String status; // OPEN, IN_REVIEW, RESOLVED_CUSTOMER_WINS, RESOLVED_VENDOR_WINS, CLOSED

    @Column(name = "admin_decision", columnDefinition = "TEXT")
    private String adminDecision;

    @Column(name = "refund_amount")
    private BigDecimal refundAmount;

    @Column(name = "resolved_at")
    private ZonedDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
