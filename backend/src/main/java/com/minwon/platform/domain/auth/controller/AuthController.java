package com.minwon.platform.domain.auth.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.auth.dto.LoginRequest;
import com.minwon.platform.domain.auth.dto.LoginResponse;
import com.minwon.platform.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "인증 API", description = "로그인 및 JWT 토큰 발급 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "로그인",
            description = "loginId / password 로 인증 후 JWT Access Token을 발급합니다. " +
                          "미승인 사용자(approved_yn=N)는 403을 반환합니다. " +
                          "아이디·비밀번호 오류는 구분 없이 401로 응답합니다."
    )
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }
}
