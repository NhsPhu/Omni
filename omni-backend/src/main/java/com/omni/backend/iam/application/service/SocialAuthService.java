package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.SocialLoginRequest;
import com.omni.backend.iam.domain.Role;
import com.omni.backend.iam.domain.UserStatus;
import com.omni.backend.shared.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String GOOGLE_VERIFY_URL =
            "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String FACEBOOK_VERIFY_URL =
            "https://graph.facebook.com/me?fields=id,email,name,picture&access_token=";

    // ──────────────────────────────────────────────────────────────
    //  Public entry point
    // ──────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse loginWithSocial(SocialLoginRequest req) {
        SocialUserInfo info = switch (req.getProvider().toUpperCase()) {
            case "GOOGLE"   -> verifyGoogle(req.getAccessToken());
            case "FACEBOOK" -> verifyFacebook(req.getAccessToken());
            default         -> throw new IllegalArgumentException("Provider không hợp lệ: " + req.getProvider());
        };

        UserJpaEntity user = findOrCreateUser(info, req.getProvider().toUpperCase());

        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        boolean hasPin = user.getPinHash() != null && !user.getPinHash().isEmpty();
        String accessToken = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId().toString(), user.getFullName(), hasPassword, hasPin);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken("social-no-refresh") // Social users use short-lived JWT
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ──────────────────────────────────────────────────────────────
    //  Google verification
    // ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private SocialUserInfo verifyGoogle(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    GOOGLE_VERIFY_URL + "?access_token=" + accessToken, Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null) throw new RuntimeException("Google token verification failed: empty response");

            String providerId = (String) body.get("sub");
            String email      = (String) body.get("email");
            String name       = (String) body.get("name");
            String picture    = (String) body.get("picture");

            if (email == null || providerId == null) {
                throw new RuntimeException("Google account không có email. Vui lòng đăng nhập bằng email/mật khẩu.");
            }
            return new SocialUserInfo(providerId, email, name, picture);
        } catch (Exception e) {
            log.error("Google token verification error: {}", e.getMessage());
            throw new RuntimeException("Xác thực Google thất bại. Token có thể đã hết hạn.");
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Facebook verification
    // ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private SocialUserInfo verifyFacebook(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    FACEBOOK_VERIFY_URL + accessToken, Map.class);
            Map<String, Object> body = response.getBody();
            if (body == null) throw new RuntimeException("Facebook token verification failed: empty response");

            String providerId = (String) body.get("id");
            String email      = (String) body.get("email");
            String name       = (String) body.get("name");

            // Facebook: picture is nested
            String picture = null;
            Object picObj = body.get("picture");
            if (picObj instanceof Map<?,?> picMap) {
                Object data = picMap.get("data");
                if (data instanceof Map<?,?> dataMap) {
                    picture = (String) dataMap.get("url");
                }
            }

            if (email == null || providerId == null) {
                throw new RuntimeException("Facebook account không có email. Vui lòng cấp quyền email hoặc đăng nhập bằng email/mật khẩu.");
            }
            return new SocialUserInfo(providerId, email, name, picture);
        } catch (Exception e) {
            log.error("Facebook token verification error: {}", e.getMessage());
            throw new RuntimeException("Xác thực Facebook thất bại. Token có thể đã hết hạn.");
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Find or create user (upsert)
    // ──────────────────────────────────────────────────────────────

    private UserJpaEntity findOrCreateUser(SocialUserInfo info, String provider) {
        // 1. Tìm theo (provider, providerId) — đăng nhập lần 2+
        Optional<UserJpaEntity> existing = userRepository
                .findByProviderAndProviderId(provider, info.providerId());
        if (existing.isPresent()) {
            UserJpaEntity user = existing.get();
            // Cập nhật avatar nếu thay đổi
            if (info.picture() != null && !info.picture().equals(user.getAvatarUrl())) {
                user.setAvatarUrl(info.picture());
                userRepository.save(user);
            }
            return user;
        }

        // 2. Tìm theo email — link account nếu email đã tồn tại
        Optional<UserJpaEntity> byEmail = userRepository.findByEmail(info.email());
        if (byEmail.isPresent()) {
            UserJpaEntity user = byEmail.get();
            // Link social provider vào tài khoản email cũ
            if ("LOCAL".equals(user.getProvider())) {
                log.info("Linking {} account for email: {}", provider, info.email());
            }
            user.setProvider(provider);
            user.setProviderId(info.providerId());
            if (info.picture() != null && user.getAvatarUrl() == null) {
                user.setAvatarUrl(info.picture());
            }
            user.setStatus(UserStatus.ACTIVE); // Activate nếu trước đó INACTIVE
            return userRepository.save(user);
        }

        // 3. Tạo user mới — social users được ACTIVE ngay, không cần verify email
        UserJpaEntity newUser = UserJpaEntity.builder()
                .email(info.email())
                .fullName(info.name() != null ? info.name() : info.email())
                .avatarUrl(info.picture())
                .provider(provider)
                .providerId(info.providerId())
                .role(Role.ROLE_CUSTOMER)
                .status(UserStatus.ACTIVE)
                // passwordHash = null (không set vì social login không cần password)
                .build();

        log.info("Creating new {} user: {}", provider, info.email());
        return userRepository.save(newUser);
    }

    // ──────────────────────────────────────────────────────────────
    //  Internal record
    // ──────────────────────────────────────────────────────────────

    private record SocialUserInfo(
            String providerId,
            String email,
            String name,
            String picture
    ) {}
}
