package com.minwon.platform.domain.inquiry.dto;

import com.minwon.platform.domain.inquiry.entity.Inquiry;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * GET /api/v1/inquiries, GET /api/v1/inquiries/{inquiryId} 공통 응답 DTO.
 * Inquiry 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 * 조회는 ADMIN 전용이므로 문의자 정보를 그대로 담는다.
 */
@Getter
@Builder
public class InquiryResponse {

    private Long inquiryId;
    private String firebaseId;
    private String content;
    private String statusCode;

    // TODO(3.2-d 후속): 문의자 loginId — 개발자 검토 후 마스킹 적용 지점 (현재 조회는 ADMIN 전용)
    private String inquirerName;

    // TODO(3.2-d 후속): 문의자 이메일 — 개인정보, 개발자 검토 후 마스킹 적용 지점 (현재는 NULL)
    private String inquirerEmail;

    private String replyContent;
    private LocalDateTime repliedAt;
    private String repliedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Inquiry 엔티티 → InquiryResponse DTO 변환 */
    public static InquiryResponse from(Inquiry inquiry) {
        return InquiryResponse.builder()
                .inquiryId(inquiry.getInquiryId())
                .firebaseId(inquiry.getFirebaseId())
                .content(inquiry.getContent())
                .statusCode(inquiry.getStatusCode())
                .inquirerName(inquiry.getInquirerName())
                .inquirerEmail(inquiry.getInquirerEmail())
                .replyContent(inquiry.getReplyContent())
                .repliedAt(inquiry.getRepliedAt())
                .repliedBy(inquiry.getRepliedBy())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .build();
    }
}
