package com.minwon.platform.domain.auth.service;

import com.minwon.platform.common.exception.AuthException;
import com.minwon.platform.common.security.JwtTokenProvider;
import com.minwon.platform.domain.auth.dto.LoginRequest;
import com.minwon.platform.domain.auth.dto.LoginResponse;
import com.minwon.platform.domain.user.entity.UserMaster;
import com.minwon.platform.domain.user.repository.UserMasterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    // 아이디/비밀번호 구분 노출 금지: 두 경우 모두 동일한 메시지 사용
    private static final String LOGIN_FAILED_MSG = "아이디 또는 비밀번호가 올바르지 않습니다.";

    private final UserMasterRepository userMasterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 로그인 처리 흐름:
     * 1. login_id 로 사용자 조회 (없으면 LOGIN_FAILED 401)
     * 2. BCrypt 비밀번호 검증 (틀리면 LOGIN_FAILED 401)
     * 3. 미승인 사용자 차단 (NOT_APPROVED 403)
     * 4. JWT Access Token 발급
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: loginId={}", request.getLoginId());

        // 1. 사용자 조회 — 존재하지 않아도 아이디/비번 구분 없이 동일 에러 반환
        UserMaster user = userMasterRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> {
                    log.warn("로그인 실패 — 존재하지 않는 계정: loginId={}", request.getLoginId());
                    return new AuthException("LOGIN_FAILED", LOGIN_FAILED_MSG, HttpStatus.UNAUTHORIZED);
                });

        // 2. 비밀번호 검증 — 반드시 matches() 사용, 평문 직접 비교 금지
        // 보안 정책: 비밀번호 해시값은 로그에 절대 출력하지 않는다
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("로그인 실패 — 비밀번호 불일치: loginId={}", request.getLoginId());
            throw new AuthException("LOGIN_FAILED", LOGIN_FAILED_MSG, HttpStatus.UNAUTHORIZED);
        }

        // 3. 미승인 사용자 차단 (비밀번호 검증 통과 후에만 승인 여부 확인)
        if (!"Y".equals(user.getApprovedYn())) {
            log.warn("로그인 거부 — 미승인 사용자: loginId={}", request.getLoginId());
            throw new AuthException("NOT_APPROVED", "관리자 승인 대기 중입니다.", HttpStatus.FORBIDDEN);
        }

        // 4. JWT Access Token 발급
        // 보안 정책: 비밀번호는 payload에 담지 않는다 (loginId, userId만 포함)
        String accessToken = jwtTokenProvider.generateAccessToken(user.getLoginId(), user.getUserMasterId());
        log.info("로그인 성공: loginId={}", request.getLoginId());
        // 보안 정책: 토큰 값은 로그에 출력하지 않는다

        return LoginResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .build();
    }
}
