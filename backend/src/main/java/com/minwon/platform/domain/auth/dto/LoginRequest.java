package com.minwon.platform.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

/**
 * POST /api/v1/auth/login 요청 DTO.
 * 두 필드 모두 필수. 에러 메시지는 아이디/비밀번호를 구분하지 않는다.
 */
@Getter
public class LoginRequest {

    @NotBlank(message = "로그인 ID는 필수입니다.")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}
