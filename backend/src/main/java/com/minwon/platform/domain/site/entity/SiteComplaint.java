package com.minwon.platform.domain.site.entity;

import com.minwon.platform.domain.site.dto.SiteComplaintCreateRequest;
import com.minwon.platform.domain.site.dto.SiteComplaintUpdateRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * tb_site_complaint (현장 민원) 테이블 매핑 엔티티
 * 현장(tb_site)에 종속된 자식 리소스. site_id FK로 부모 현장을 참조한다.
 * complaint_number는 SITE001-0001 형식의 현장별 민원번호(VARCHAR, 현장 내 유니크)
 * status_code 기본값: IN_PROGRESS (한글 저장 제거)
 * created_by/updated_by 컬럼이 schema에 없으므로 actor 정보는 ActivityLog로만 기록.
 * tb_site_complaint_response_plan(조치방안 연결)은 ActionPlan 도메인 구축 시 함께 처리 예정.
 */
@Entity
@Table(name = "tb_site_complaint")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
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

    // TODO(3.2-d 후속): 신청인 성명 — security.md 5번 민감도 '중간', 개발자 검토 후 마스킹 적용 지점
    @Column(name = "complainant", length = 500, nullable = false)
    private String complainant;

    @Column(name = "usage_info", columnDefinition = "TEXT")
    private String usageInfo;

    // TODO(3.2-d 후속): 소유자 정보 — 개인정보 포함 가능, 개발자 검토 후 마스킹 적용 지점
    @Column(name = "owner_info", columnDefinition = "TEXT")
    private String ownerInfo;

    // COMPLAINT_STATUS 코드값 저장 (tb_code_master 참조, FK 아님)
    @Builder.Default
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

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // 논리 삭제 (use_yn 없음, deleted_yn만 존재)
    @Builder.Default
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

    // 유사사례 배열 — @BatchSize: 목록 조회 시 IN절 배치 쿼리로 N+1 방지 (MultipleBagFetchException 회피)
    @Builder.Default
    @BatchSize(size = 100)
    @OrderBy("sortOrder ASC")
    @OneToMany(mappedBy = "siteComplaint", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SiteComplaintSimilarCase> similarCases = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 현장 민원 등록 팩토리 메서드. 부모 현장(Site)은 Service에서 존재 검증 후 전달받는다. */
    public static SiteComplaint create(SiteComplaintCreateRequest request, Site site) {
        return SiteComplaint.builder()
                .site(site)
                .firebaseId(request.getFirebaseId())
                .complaintNumber(request.getComplaintNumber())
                .complainant(request.getComplainant())
                .usageInfo(request.getUsageInfo())
                .ownerInfo(request.getOwnerInfo())
                .statusCode(request.getStatusCode() != null && !request.getStatusCode().isBlank()
                        ? request.getStatusCode() : "IN_PROGRESS")
                .stageCode(request.getStageCode())
                .stageOccurrence(request.getStageOccurrence())
                .stageResponse(request.getStageResponse())
                .stageNegotiation(request.getStageNegotiation())
                .stageAgreement(request.getStageAgreement())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .deletedYn("N")
                .build();
    }

    /** 현장 민원 정보 수정. statusCode/sortOrder 미전달 시 기존 값 유지. updatedAt은 @PreUpdate가 자동 처리. */
    public void updateInfo(SiteComplaintUpdateRequest request) {
        this.firebaseId = request.getFirebaseId();
        this.complaintNumber = request.getComplaintNumber();
        this.complainant = request.getComplainant();
        this.usageInfo = request.getUsageInfo();
        this.ownerInfo = request.getOwnerInfo();
        if (request.getStatusCode() != null && !request.getStatusCode().isBlank()) {
            this.statusCode = request.getStatusCode();
        }
        this.stageCode = request.getStageCode();
        this.stageOccurrence = request.getStageOccurrence();
        this.stageResponse = request.getStageResponse();
        this.stageNegotiation = request.getStageNegotiation();
        this.stageAgreement = request.getStageAgreement();
        if (request.getSortOrder() != null) {
            this.sortOrder = request.getSortOrder();
        }
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by=actor. 물리 삭제 금지. */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
    }
}
