package com.omni.backend.iam.application.port.in;

import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.LoginRequest;
import com.omni.backend.iam.application.dto.RegisterRequest;

public interface AuthUseCase {
    void registerUser(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void verifyEmail(String token);
    AuthResponse refreshToken(String refreshToken);
}
