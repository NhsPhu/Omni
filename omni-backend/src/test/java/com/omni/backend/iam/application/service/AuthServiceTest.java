package com.omni.backend.iam.application.service;

import com.omni.backend.iam.adapter.persistence.entity.EmailVerificationTokenJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.RefreshTokenJpaEntity;
import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.EmailVerificationTokenRepository;
import com.omni.backend.iam.adapter.persistence.repository.RefreshTokenRepository;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.LoginRequest;
import com.omni.backend.iam.application.dto.RegisterRequest;
import com.omni.backend.iam.application.dto.ForgotPasswordRequest;
import com.omni.backend.iam.application.dto.ResetPasswordRequest;
import com.omni.backend.iam.adapter.persistence.entity.PasswordResetTokenJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.PasswordResetTokenRepository;
import com.omni.backend.iam.domain.Role;
import com.omni.backend.iam.domain.UserStatus;
import com.omni.backend.notification.application.service.EmailService;
import com.omni.backend.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailVerificationTokenRepository verificationTokenRepo;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepo;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private UserJpaEntity testUser;
    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendBaseUrl", "http://localhost:3000");

        testUser = UserJpaEntity.builder()
                .id(testUserId)
                .email("test@example.com")
                .passwordHash("hashed-password")
                .fullName("Test User")
                .role(Role.ROLE_CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("password");
        request.setFullName("New User");
        request.setPhone("123456789");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(UserJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        authService.registerUser(request);

        verify(userRepository).save(any(UserJpaEntity.class));
        verify(verificationTokenRepo).save(any(EmailVerificationTokenJpaEntity.class));
        verify(emailService).sendEmailWithTemplate(eq("new@example.com"), anyString(), anyString(), anyMap());
    }

    @Test
    void testRegisterUser_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.registerUser(request));
        assertEquals("Email is already registered", exception.getMessage());
        verify(userRepository, never()).save(any(UserJpaEntity.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyString(), anyString(), anyBoolean(), anyBoolean())).thenReturn("mock-access-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-access-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());

        verify(refreshTokenRepository).deleteByUserId(testUserId);
        verify(refreshTokenRepository).save(any(RefreshTokenJpaEntity.class));
    }

    @Test
    void testLogin_UserBanned() {
        LoginRequest request = new LoginRequest();
        request.setEmail("banned@example.com");
        request.setPassword("password");

        testUser.setStatus(UserStatus.BANNED);

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("User is banned", exception.getMessage());
    }

    @Test
    void testVerifyEmail_Success() {
        String token = "valid-token";
        EmailVerificationTokenJpaEntity vToken = EmailVerificationTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        when(verificationTokenRepo.findByToken(token)).thenReturn(Optional.of(vToken));
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        authService.verifyEmail(token);

        assertEquals(UserStatus.ACTIVE, testUser.getStatus());
        assertNotNull(vToken.getUsedAt());
        verify(userRepository).save(testUser);
        verify(verificationTokenRepo).save(vToken);
        verify(emailService).sendEmailWithTemplate(eq(testUser.getEmail()), anyString(), anyString(), anyMap());
    }

    @Test
    void testVerifyEmail_TokenExpired() {
        String token = "expired-token";
        EmailVerificationTokenJpaEntity vToken = EmailVerificationTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiresAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .build();

        when(verificationTokenRepo.findByToken(token)).thenReturn(Optional.of(vToken));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.verifyEmail(token));
        assertEquals("Token đã hết hạn", exception.getMessage());
    }

    @Test
    void testRefreshToken_Success() {
        String token = "valid-refresh-token";
        RefreshTokenJpaEntity tokenEntity = RefreshTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiryDate(ZonedDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByToken(token)).thenReturn(Optional.of(tokenEntity));
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateToken(anyString(), anyString(), anyString(), anyString(), anyBoolean(), anyBoolean())).thenReturn("new-access-token");

        AuthResponse response = authService.refreshToken(token);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals(token, response.getRefreshToken());
    }

    @Test
    void testRefreshToken_Expired() {
        String token = "expired-refresh-token";
        RefreshTokenJpaEntity tokenEntity = RefreshTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiryDate(ZonedDateTime.now().minusDays(1))
                .build();

        when(refreshTokenRepository.findByToken(token)).thenReturn(Optional.of(tokenEntity));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.refreshToken(token));
        assertEquals("Refresh token đã hết hạn. Vui lòng đăng nhập lại.", exception.getMessage());
        verify(refreshTokenRepository).deleteByToken(token);
    }

    @Test
    void testForgotPassword_Success() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepo.save(any(PasswordResetTokenJpaEntity.class))).thenAnswer(i -> i.getArgument(0));

        authService.forgotPassword(request);

        verify(passwordResetTokenRepo).save(any(PasswordResetTokenJpaEntity.class));
        verify(emailService).sendEmailWithTemplate(eq("test@example.com"), anyString(), anyString(), anyMap());
    }

    @Test
    void testForgotPassword_UserNotFound() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("notfound@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.forgotPassword(request));
        assertEquals("Tài khoản không tồn tại", exception.getMessage());
        verify(passwordResetTokenRepo, never()).save(any());
    }

    @Test
    void testResetPassword_Success() {
        String token = "valid-reset-token";
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("new-secure-password");

        PasswordResetTokenJpaEntity resetToken = PasswordResetTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        when(passwordResetTokenRepo.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(request.getNewPassword())).thenReturn("new-hashed-password");

        authService.resetPassword(request);

        assertEquals("new-hashed-password", testUser.getPasswordHash());
        assertNotNull(resetToken.getUsedAt());
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepo).save(resetToken);
    }

    @Test
    void testResetPassword_TokenExpired() {
        String token = "expired-reset-token";
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(token);
        request.setNewPassword("new-secure-password");

        PasswordResetTokenJpaEntity resetToken = PasswordResetTokenJpaEntity.builder()
                .userId(testUserId)
                .token(token)
                .expiresAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .build();

        when(passwordResetTokenRepo.findByToken(token)).thenReturn(Optional.of(resetToken));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.resetPassword(request));
        assertEquals("Token đã hết hạn", exception.getMessage());
        verify(userRepository, never()).save(any());
    }
}
