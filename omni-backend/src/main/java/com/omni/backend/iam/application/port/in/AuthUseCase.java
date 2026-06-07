package com.omni.backend.iam.application.port.in;

import com.omni.backend.iam.application.dto.AuthResponse;
import com.omni.backend.iam.application.dto.LoginRequest;
import com.omni.backend.iam.application.dto.RegisterRequest;
import com.omni.backend.iam.application.dto.ForgotPasswordRequest;
import com.omni.backend.iam.application.dto.ResetPasswordRequest;

public interface AuthUseCase {
    void registerUser(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void verifyEmail(String token);
    AuthResponse refreshToken(String refreshToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
