package com.minwon.platform.common.config;

import com.minwon.platform.common.security.JwtAccessDeniedHandler;
import com.minwon.platform.common.security.JwtAuthenticationEntryPoint;
import com.minwon.platform.common.security.JwtAuthenticationFilter;
import com.minwon.platform.common.security.JwtTokenProvider;
import com.minwon.platform.domain.user.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security 설정.
 * JWT 기반 Stateless 인증: 세션 미사용, 쿠키 기반 인증 없음.
 * 인증 실패(401) 및 권한 부족(403) 모두 공통 JSON 포맷으로 응답한다.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final UserRoleRepository userRoleRepository;

    /**
     * 허용 Origin 목록은 application.yml → CORS_ALLOWED_ORIGINS 환경변수로 관리.
     * 하드코딩 금지. 여러 origin은 쉼표로 구분: "http://localhost:3000,https://prod.example.com"
     */
    @Value("${cors.allowed-origins}")
    private String allowedOriginsRaw;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API는 CSRF 토큰 불필요 (JWT로 인증하며 세션 미사용)
                .csrf(AbstractHttpConfigurer::disable)
                // CORS 설정: corsConfigurationSource() 빈 사용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
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
                        // ADMIN 전용: 사용자 관리, 활동로그 조회, 시스템 설정
                        .requestMatchers("/api/v1/users/**", "/api/v1/activity-logs/**", "/api/v1/admin/**")
                            .hasRole("ADMIN")
                        // 현장 데이터 CRUD: ADMIN, MANAGER 모두 허용
                        .requestMatchers("/api/v1/sites/**")
                            .hasAnyRole("ADMIN", "MANAGER")
                        // 사례 조회: 인증된 사용자(MANAGER, ADMIN) 허용 — 역할 세분화·마스킹은 3.2-d 검토 후 적용
                        .requestMatchers("/api/v1/case-examples/**").authenticated()
                        // 대응가이드 CRUD: 인증된 사용자(MANAGER, ADMIN) 허용 — 역할 세분화·마스킹은 3.2-d 검토 후 적용
                        .requestMatchers("/api/v1/response-guides/**").authenticated()
                        // 그 외 모든 요청은 유효한 JWT 토큰 필수
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        // 인증 실패(토큰 없음/유효하지 않음) → JSON 401
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        // 인증은 됐으나 권한 부족 → JSON 403
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 실행
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider, userRoleRepository),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /**
     * CORS 정책 설정.
     * allowedOrigins("*") 절대 금지 — 허용 origin은 환경변수로만 관리.
     * preflight(OPTIONS) 요청은 maxAge 내 캐시되어 재확인 없이 통과.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용 origin 목록: 쉼표 구분 문자열을 리스트로 변환
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        // allowCredentials=true 시 allowedOrigins에 "*" 사용 불가 — origin을 명시해야 함
        configuration.setAllowCredentials(true);
        // preflight 캐시 시간 1시간 (OPTIONS 반복 요청 최소화)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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
