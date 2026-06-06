package com.omni.backend.notification.adapter.persistence.repository;

import com.omni.backend.notification.adapter.persistence.entity.NewsletterSubscriberJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriberJpaEntity, UUID> {
    Optional<NewsletterSubscriberJpaEntity> findByEmail(String email);
}
