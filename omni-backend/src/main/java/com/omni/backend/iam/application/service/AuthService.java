package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.LoginRequest;
import com.omni.backend.iam.application.dto.RegisterRequest;
import com.omni.backend.iam.application.port.in.AuthUseCase;
import com.omni.backend.iam.domain.Role;
import com.omni.backend.iam.domain.UserStatus;
import com.omni.backend.shared.security.JwtTokenProvider;
import com.omni.backend.iam.adapter.persistence.entity.EmailVerificationTokenJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.EmailVerificationTokenRepository;
import com.omni.backend.notification.application.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationTokenRepository verificationTokenRepo;
    private final com.omni.backend.iam.adapter.persistence.repository.RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        UserJpaEntity user = UserJpaEntity.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.ROLE_CUSTOMER)
                .status(UserStatus.INACTIVE) // Requires email verification later
                .build();

        userRepository.save(user);

        // Tạo verification token
        String token = java.util.UUID.randomUUID().toString();
        EmailVerificationTokenJpaEntity verificationToken = EmailVerificationTokenJpaEntity.builder()
            .userId(user.getId())
            .token(token)
            .expiresAt(java.time.Instant.now().plus(24, java.time.temporal.ChronoUnit.HOURS))
            .build();
        verificationTokenRepo.save(verificationToken);

        // Gửi email
        String verificationUrl = frontendBaseUrl + "/verify-email?token=" + token;
        emailService.sendEmailWithTemplate(
            user.getEmail(),
            "Xác thực tài khoản Omni",
            "email/email-verification",
            java.util.Map.of(
                "userName", user.getFullName(),
                "verificationUrl", verificationUrl
            )
        );
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserJpaEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new RuntimeException("User is banned");
        }

        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        boolean hasPin = user.getPinHash() != null && !user.getPinHash().isEmpty();
        String accessToken = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId().toString(), user.getFullName(), hasPassword, hasPin);

        String refreshToken = java.util.UUID.randomUUID().toString();
        
        // Remove old tokens
        refreshTokenRepository.deleteByUserId(user.getId());
        
        com.omni.backend.iam.adapter.persistence.entity.RefreshTokenJpaEntity tokenEntity = com.omni.backend.iam.adapter.persistence.entity.RefreshTokenJpaEntity.builder()
                .userId(user.getId())
                .token(refreshToken)
                .expiryDate(java.time.ZonedDateTime.now().plusDays(30))
                .build();
        refreshTokenRepository.save(tokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationTokenJpaEntity vToken = verificationTokenRepo.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Token không hợp lệ"));
        
        if (vToken.getExpiresAt().isBefore(java.time.Instant.now()))
            throw new RuntimeException("Token đã hết hạn");
        
        if (vToken.getUsedAt() != null)
            throw new RuntimeException("Token đã được sử dụng");
        
        // Kích hoạt tài khoản
        UserJpaEntity user = userRepository.findById(vToken.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        vToken.setUsedAt(java.time.Instant.now());
        verificationTokenRepo.save(vToken);
        
        // Gửi Welcome email
        try {
            emailService.sendEmailWithTemplate(
                user.getEmail(),
                "Chào mừng bạn đến với Omni!",
                "email/welcome",
                java.util.Map.of("userName", user.getFullName())
            );
        } catch (Exception e) {
            // Ignore email error to not fail the transaction
        }
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        com.omni.backend.iam.adapter.persistence.entity.RefreshTokenJpaEntity tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));
                
        if (tokenEntity.getExpiryDate().isBefore(java.time.ZonedDateTime.now())) {
            refreshTokenRepository.deleteByToken(refreshToken);
            throw new RuntimeException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }
        
        UserJpaEntity user = userRepository.findById(tokenEntity.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
                
        if (user.getStatus() == UserStatus.BANNED) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }
        
        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        boolean hasPin = user.getPinHash() != null && !user.getPinHash().isEmpty();
        String newAccessToken = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId().toString(), user.getFullName(), hasPassword, hasPin);
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Return the same refresh token, or could rotate
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
