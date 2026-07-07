package com.minwon.platform.domain.inquiry.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * PUT /api/v1/inquiries/{inquiryId} 요청 DTO (ADMIN 전용) — 답변 등록/상태 변경 전용.
 * 문의 원문(content)은 수정 대상이 아니다 (본문에 포함하지 않음).
 * replyContent 전달 시 replied_at/replied_by가 서버에서 자동 기록된다.
 */
@Getter
public class InquiryUpdateRequest {

    // 답변 내용 — 미전달 시 기존 답변 유지
    private String replyContent;

    // INQUIRY_STATUS 코드 (PENDING/RESOLVED) — 미전달 시 기존 상태 유지
    @Size(max = 100, message = "상태 코드는 100자 이하여야 합니다.")
    private String statusCode;
}
