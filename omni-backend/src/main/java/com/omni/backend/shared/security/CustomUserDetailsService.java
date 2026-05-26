package com.omni.backend.shared.security;

import com.omni.backend.iam.adapter.persistence.entity.UserJpaEntity;
import com.omni.backend.iam.adapter.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserJpaEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "",
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
