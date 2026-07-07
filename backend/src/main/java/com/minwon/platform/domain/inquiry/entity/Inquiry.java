package com.minwon.platform.domain.inquiry.entity;

import com.minwon.platform.domain.inquiry.dto.InquiryCreateRequest;
import com.minwon.platform.domain.inquiry.dto.InquiryUpdateRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_inquiry (문의) 테이블 매핑 엔티티 — Firebase inquiries 컬렉션 전환.
 * 문의자 정보(inquirer_name)는 클라이언트 입력이 아닌 서버(JWT actor)에서 기록한다.
 * 문의 원문(content)은 수정 불가 — PUT은 답변/상태 변경 전용.
 * 권한: 등록은 MANAGER+ADMIN, 조회/수정/삭제는 ADMIN 전용 (SecurityConfig 메서드별 규칙).
 */
@Entity
@Table(name = "tb_inquiry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Long inquiryId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    // INQUIRY_STATUS 코드값 저장 (PENDING/RESOLVED, tb_code_master 논리 참조)
    @Builder.Default
    @Column(name = "status_code", length = 100, nullable = false)
    private String statusCode = "PENDING";

    // TODO(3.2-d 후속): 문의자 loginId — 개인 식별 정보, 개발자 검토 후 마스킹 적용 지점
    @Column(name = "inquirer_name", length = 100, nullable = false)
    private String inquirerName;

    // TODO(3.2-d 후속): 문의자 이메일 — 개인정보(security.md 5번 actorEmail과 동일 성격).
    // 현재 CurrentUserProvider가 실제 이메일을 제공하지 않아 NULL, UserDetails 연동 후 기록 예정.
    @Column(name = "inquirer_email", length = 255)
    private String inquirerEmail;

    @Column(name = "reply_content", columnDefinition = "TEXT")
    private String replyContent;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(name = "replied_by", length = 100)
    private String repliedBy;

    // 논리 삭제 (use_yn 없음 — 문의 활성/비활성은 status_code로 관리)
    @Builder.Default
    @Column(name = "deleted_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String deletedYn = "N";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    // 공통 감사 컬럼
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 문의 등록: 문의자(inquirerName)는 요청 본문이 아닌 서버의 actor(loginId)로 기록한다. */
    public static Inquiry create(InquiryCreateRequest request, String actor) {
        return Inquiry.builder()
                .firebaseId(request.getFirebaseId())
                .content(request.getContent())
                .statusCode("PENDING")
                .inquirerName(actor)
                .deletedYn("N")
                .createdBy(actor)
                .updatedBy(actor)
                .build();
    }

    /**
     * 문의 수정 — 답변 등록/상태 변경 전용. 문의 원문(content)은 변경하지 않는다.
     * replyContent 전달 시 답변 갱신 + replied_at/replied_by 기록.
     * statusCode 전달 시 상태 변경 (미전달 시 기존 값 유지).
     */
    public void updateInfo(InquiryUpdateRequest request, String actor) {
        if (request.getReplyContent() != null) {
            this.replyContent = request.getReplyContent();
            this.repliedAt = LocalDateTime.now();
            this.repliedBy = actor;
        }
        if (request.getStatusCode() != null && !request.getStatusCode().isBlank()) {
            this.statusCode = request.getStatusCode();
        }
        this.updatedBy = actor;
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by/updated_by=actor. 물리 삭제 금지. */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
        this.updatedBy = actor;
    }
}
