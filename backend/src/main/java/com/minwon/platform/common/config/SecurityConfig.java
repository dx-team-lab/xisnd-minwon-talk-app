package com.minwon.platform.common.config;

import com.minwon.platform.common.security.JwtAuthenticationEntryPoint;
import com.minwon.platform.common.security.JwtAuthenticationFilter;
import com.minwon.platform.common.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 설정.
 * JWT 기반 Stateless 인증: 세션 미사용, 쿠키 기반 인증 없음.
 * 인증 실패 시 Spring 기본 로그인 페이지 대신 JSON 401을 반환한다.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API는 CSRF 토큰 불필요 (JWT로 인증하며 세션 미사용)
                .csrf(AbstractHttpConfigurer::disable)
                // 세션을 생성하거나 사용하지 않음 — JWT로 상태를 관리
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 로그인 API: 인증 없이 접근 가능
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // API 문서: 개발 편의상 허용
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        // 헬스 체크: 모니터링 도구에서 인증 없이 호출
                        .requestMatchers("/api/health").permitAll()
                        // 그 외 모든 요청은 유효한 JWT 토큰 필수
                        .anyRequest().authenticated()
                )
                // 인증 실패(토큰 없음/유효하지 않음) → JSON 401 반환 (Spring 기본 리다이렉트 방지)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 실행
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * BCrypt 비밀번호 해시 인코더.
     * 비밀번호는 단방향 해시로만 저장. 평문 저장 금지.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
