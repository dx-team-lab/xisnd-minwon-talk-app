package com.minwon.platform.domain.auth.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * POST /api/v1/auth/login 성공 응답 DTO.
 * password_hash 등 민감 필드는 절대 포함하지 않는다.
 */
@Getter
@Builder
public class LoginResponse {

    private String accessToken;

    // RFC 6750 표준 Bearer 토큰 타입 명시
    private String tokenType;

    // 만료까지 남은 시간 (초 단위)
    private long expiresIn;
}
