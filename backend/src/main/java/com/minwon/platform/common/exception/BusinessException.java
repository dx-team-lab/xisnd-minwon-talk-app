package com.minwon.platform.common.exception;

import lombok.Getter;

/**
 * 비즈니스 규칙 위반(리소스 없음, 권한 없음 등) 시 발생하는 공통 예외.
 * GlobalExceptionHandler에서 일관된 에러 응답으로 변환된다.
 */
@Getter
public class BusinessException extends RuntimeException {

    private final String code;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
}
