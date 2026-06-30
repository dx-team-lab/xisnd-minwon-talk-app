package com.minwon.platform.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 기본 설정.
 *
 * [임시 설정 — Phase 3.2-a]
 * 현재는 JWT 인증 로직이 없으므로 모든 요청을 허용한다.
 * TODO: Phase 3.2-c에서 JWT 인증 필터로 교체, Phase 3.2-d에서 권한 제어 추가.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * HTTP 보안 필터 체인.
     *
     * 임시 설정: 모든 요청 허용(permitAll) + CSRF 비활성화.
     * TODO: Phase 3.2-c에서 JWT 인증 필터로 교체, Phase 3.2-d에서 권한 제어 추가.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API는 세션 기반 CSRF 보호가 불필요하다 (JWT로 대체 예정)
                // TODO: Phase 3.2-c에서 JWT 인증 필터로 교체, Phase 3.2-d에서 권한 제어 추가.
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 로그인 API: 인증 없이 접근 가능 (명시적 허용)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Swagger UI: Phase 3.2-c 이후 JWT 필터 추가 시에도 접근 가능하도록 명시
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // TODO: Phase 3.2-c에서 JWT 인증 필터로 교체, Phase 3.2-d에서 권한 제어 추가.
                        .anyRequest().permitAll()
                );
        return http.build();
    }

    /**
     * BCrypt 비밀번호 해시 인코더.
     * 비밀번호는 이 인코더를 통해 단방향 해시로 저장된다. 평문 저장은 절대 금지.
     * Phase 3.2-b 로그인 API, Phase 3.2-c JWT 인증 서비스에서 주입하여 사용한다.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
