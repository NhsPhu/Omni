package com.omni.backend.iam.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "shops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "banner_url", length = 1000)
    private String bannerUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String status; // PENDING_REVIEW, ACTIVE, SUSPENDED

    @Column(name = "warehouse_province_id")
    private Integer warehouseProvinceId;

    @Column(name = "warehouse_district_id")
    private Integer warehouseDistrictId;

    @Column(name = "warehouse_ward_code", length = 20)
    private String warehouseWardCode;
    
    @Column(name = "ghn_shop_id", length = 50)
    private String ghnShopId;
    
    @Column(name = "approved_at")
    private ZonedDateTime approvedAt;
    
    @Column(name = "approved_by")
    private UUID approvedBy;
    
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "pickup_address", columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_name", length = 255)
    private String bankName;

    @Column(name = "bank_account_name", length = 255)
    private String bankAccountName;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "total_sales")
    private Integer totalSales;

    @Column(name = "deleted_at")
    private ZonedDateTime deletedAt;

    @Column(name = "ai_chatbot_enabled")
    private Boolean aiChatbotEnabled = false;

    @Column(name = "ai_provider", length = 50)
    private String aiProvider = "gemini";

    @Column(name = "ai_tone", length = 50)
    private String aiTone = "professional";

    @Column(name = "ai_custom_instructions", columnDefinition = "TEXT")
    private String aiCustomInstructions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
