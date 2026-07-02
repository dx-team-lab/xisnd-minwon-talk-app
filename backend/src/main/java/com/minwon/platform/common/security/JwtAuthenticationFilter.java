package com.minwon.platform.common.security;

import com.minwon.platform.domain.user.repository.UserRoleRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 모든 요청에 한 번만 실행되는 JWT 인증 필터.
 * Authorization: Bearer {token} 헤더를 읽어 검증 후 SecurityContextHolder에 인증정보를 설정한다.
 * 역할은 매 요청마다 DB에서 조회하여 즉시 반영된다 (JWT 재발급 없이 역할 변경 효과).
 * 토큰이 없거나 유효하지 않으면 인증정보를 설정하지 않고 다음 필터로 넘긴다(SecurityConfig가 401 처리).
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRoleRepository userRoleRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String loginId = jwtTokenProvider.getLoginId(token);

            // DB에서 역할 코드 조회 → 역할 변경이 즉시 반영됨 (재로그인 불필요)
            // 보안 정책: 로그에 토큰 값은 절대 출력하지 않는다
            List<GrantedAuthority> authorities = userRoleRepository.findRoleCodesByLoginId(loginId)
                    .stream()
                    .map(roleCode -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + roleCode))
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(loginId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("JWT 인증 성공: loginId={}, roles=[{}], uri={}",
                    loginId,
                    authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")),
                    request.getRequestURI());
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
