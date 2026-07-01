package com.minwon.platform.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * 모든 요청에 한 번만 실행되는 JWT 인증 필터.
 * Authorization: Bearer {token} 헤더를 읽어 검증 후 SecurityContextHolder에 인증정보를 설정한다.
 * 토큰이 없거나 유효하지 않으면 인증정보를 설정하지 않고 다음 필터로 넘긴다(SecurityConfig가 401 처리).
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String loginId = jwtTokenProvider.getLoginId(token);
            // 보안 정책: authorities는 이번 단계에서 빈 목록 — 역할별 제어는 Phase 3.2-d에서 추가
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(loginId, null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("JWT 인증 성공: loginId={}, uri={}", loginId, request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    /** Authorization 헤더에서 Bearer 토큰만 추출. 토큰 값 자체는 로그에 출력하지 않는다. */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
