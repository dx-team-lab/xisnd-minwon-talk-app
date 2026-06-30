package com.minwon.platform.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 인증/인가 실패 시 발생하는 예외.
 * - 401 UNAUTHORIZED: 로그인 실패 (LOGIN_FAILED)
 * - 403 FORBIDDEN: 미승인 사용자 (NOT_APPROVED)
 * GlobalExceptionHandler 에서 httpStatus 에 맞는 HTTP 응답으로 변환된다.
 */
@Getter
public class AuthException extends RuntimeException {

    private final String code;
    private final HttpStatus httpStatus;

    public AuthException(String code, String message, HttpStatus httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }
}
