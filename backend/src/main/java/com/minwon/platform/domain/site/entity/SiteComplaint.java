package com.minwon.platform.domain.site.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site_complaint (현장 민원) 테이블 매핑 엔티티
 * complaint_number는 SITE001-0001 형식의 현장별 민원번호(VARCHAR)
 * status_code 기본값: IN_PROGRESS (한글 저장 제거)
 */
@Entity
@Table(name = "tb_site_complaint")
@Getter
@NoArgsConstructor
public class SiteComplaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_complaint_id")
    private Long siteComplaintId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    // LAZY: 조회 시 Site를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    // 현장별 민원번호 (예: SITE001-0001), INT → VARCHAR로 변경된 컬럼
    @Column(name = "complaint_number", length = 50, nullable = false)
    private String complaintNumber;

    @Column(name = "complainant", length = 500, nullable = false)
    private String complainant;

    @Column(name = "usage_info", columnDefinition = "TEXT")
    private String usageInfo;

    @Column(name = "owner_info", columnDefinition = "TEXT")
    private String ownerInfo;

    // COMPLAINT_STATUS 코드값 저장 (tb_code_master 참조, FK 아님)
    @Column(name = "status_code", length = 100, nullable = false)
    private String statusCode = "IN_PROGRESS";

    @Column(name = "stage_code", length = 100)
    private String stageCode;

    @Column(name = "stage_occurrence", columnDefinition = "TEXT")
    private String stageOccurrence;

    @Column(name = "stage_response", columnDefinition = "TEXT")
    private String stageResponse;

    @Column(name = "stage_negotiation", columnDefinition = "TEXT")
    private String stageNegotiation;

    @Column(name = "stage_agreement", columnDefinition = "TEXT")
    private String stageAgreement;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // 논리 삭제 (use_yn 없음, deleted_yn만 존재)
    @Column(name = "deleted_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String deletedYn = "N";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
