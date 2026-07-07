package com.minwon.platform.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * POST /api/v1/inquiries 요청 DTO (MANAGER, ADMIN 허용).
 * 문의자 정보는 본문으로 받지 않는다 — 서버가 JWT actor(loginId)로 기록 (위조 방지).
 * 상태는 항상 PENDING으로 시작하므로 본문에 포함하지 않는다.
 */
@Getter
public class InquiryCreateRequest {

    @NotBlank(message = "문의 내용은 필수입니다.")
    private String content;

    @Size(max = 100, message = "Firebase ID는 100자 이하여야 합니다.")
    private String firebaseId;
}
