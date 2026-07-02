package com.minwon.platform.common.exception;

import com.minwon.platform.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * 전역 예외 처리 핸들러.
 * 모든 Controller에서 발생한 예외를 공통 응답 포맷(ApiResponse)으로 변환한다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 비즈니스 예외 — 리소스 없음, 잘못된 요청 등 */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("비즈니스 예외 발생: code={}, message={}", e.getCode(), e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    /** Request DTO Validation 실패 (@Valid, @NotBlank, @Size 등) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("입력값 검증 실패: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("INVALID_INPUT", message));
    }

    /** 인증/인가 예외 — 401(로그인 실패), 403(미승인 사용자) */
    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthException(AuthException e) {
        // 보안 정책: 비밀번호, 토큰 등 민감 정보는 로그에 남기지 않는다
        log.warn("인증/인가 예외 발생: code={}, status={}", e.getCode(), e.getHttpStatus());
        return ResponseEntity
                .status(e.getHttpStatus())
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    /**
     * 존재하지 않는 경로 요청 — Spring 6의 NoHandlerFoundException 후속 예외.
     * GlobalExceptionHandler가 없으면 Exception.class 폴백에 걸려 500이 되므로 명시적으로 처리.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException e) {
        log.warn("존재하지 않는 경로 요청: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("NOT_FOUND", "요청한 경로를 찾을 수 없습니다."));
    }

    /** 예상치 못한 서버 내부 오류 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("서버 내부 오류 발생", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다."));
    }
}
