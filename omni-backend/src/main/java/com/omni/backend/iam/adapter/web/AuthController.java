package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.LoginRequest;
import com.omni.backend.iam.application.dto.RegisterRequest;
import com.omni.backend.iam.application.dto.ForgotPasswordRequest;
import com.omni.backend.iam.application.dto.ResetPasswordRequest;
import com.omni.backend.iam.application.dto.SocialLoginRequest;
import com.omni.backend.iam.application.port.in.AuthUseCase;
import com.omni.backend.iam.application.service.SocialAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final SocialAuthService socialAuthService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        authUseCase.registerUser(request);
        return ResponseEntity.ok("User registered successfully. Please check your email to verify your account.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authUseCase.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Social login: Token Exchange Pattern
     * Frontend gửi access_token từ Google/Facebook SDK,
     * backend verify với provider API rồi trả về JWT Omni.
     */
    @PostMapping("/social")
    public ResponseEntity<AuthResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        AuthResponse response = socialAuthService.loginWithSocial(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        authUseCase.verifyEmail(token);
        return ResponseEntity.ok(java.util.Map.of("message", "Xác thực thành công"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("refreshToken");
        if (token == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authUseCase.refreshToken(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authUseCase.forgotPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Link đặt lại mật khẩu đã được gửi qua email của bạn"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authUseCase.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Mật khẩu đã được đặt lại thành công"));
    }
}
