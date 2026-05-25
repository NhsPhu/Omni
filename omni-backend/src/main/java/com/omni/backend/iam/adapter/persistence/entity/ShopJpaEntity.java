package com.omni.backend.iam.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

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

    @Column(name = "warehouse_address_code", length = 100)
    private String warehouseAddressCode;
    
    @Column(name = "approved_at")
    private ZonedDateTime approvedAt;
    
    @Column(name = "approved_by")
    private UUID approvedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
