package com.omni.backend.iam.adapter.web;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import com.omni.backend.iam.application.dto.UserProfileDto;
import com.omni.backend.shared.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        
        UserJpaEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        UserProfileDto dto = UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
                
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UserProfileDto request) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        
        UserJpaEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        userRepository.save(user);
        
        UserProfileDto dto = UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
                
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        UserJpaEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải có ít nhất 6 ký tự."));
        }

        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        if (hasPassword) {
            if (oldPassword == null || !passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu cũ không đúng."));
            }
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
    }

    @PutMapping("/pin")
    public ResponseEntity<?> setupOrUpdatePin(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> request) {
        if (userDetails == null) return ResponseEntity.status(401).build();

        UserJpaEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldPin = request.get("oldPin");
        String newPin = request.get("newPin");

        if (newPin == null || newPin.length() != 6 || !newPin.matches("\\d+")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã PIN phải là 6 chữ số."));
        }

        boolean hasPin = user.getPinHash() != null && !user.getPinHash().isEmpty();
        if (hasPin) {
            if (oldPin == null || !passwordEncoder.matches(oldPin, user.getPinHash())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã PIN cũ không đúng."));
            }
        }

        user.setPinHash(passwordEncoder.encode(newPin));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Thiết lập mã PIN thành công."));
    }
}
