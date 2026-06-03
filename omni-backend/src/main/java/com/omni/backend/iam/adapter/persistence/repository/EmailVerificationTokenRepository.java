package com.omni.backend.iam.adapter.persistence.repository;

import com.omni.backend.iam.adapter.persistence.entity.EmailVerificationTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationTokenJpaEntity, UUID> {
    Optional<EmailVerificationTokenJpaEntity> findByToken(String token);
}
