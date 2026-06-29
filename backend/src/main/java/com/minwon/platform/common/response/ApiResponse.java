package com.minwon.platform.common.response;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 모든 API의 공통 응답 래퍼.
 * { "success": true/false, "code": "OK", "message": "...", "data": {} }
 */
@Getter
@RequiredArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String code;
    private final String message;
    private final T data;

    /** 정상 응답 */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", "요청이 정상 처리되었습니다.", data);
    }

    /** 에러 응답 */
    public static <T> ApiResponse<T> error(String code, String message) {
        return new ApiResponse<>(false, code, message, null);
    }
}
