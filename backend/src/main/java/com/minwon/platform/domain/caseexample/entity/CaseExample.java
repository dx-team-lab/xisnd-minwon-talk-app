package com.minwon.platform.domain.caseexample.entity;

import com.minwon.platform.domain.caseexample.dto.CaseExampleCreateRequest;
import com.minwon.platform.domain.caseexample.dto.CaseExampleUpdateRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * tb_case_example (민원 사례) 테이블 매핑 엔티티
 * 과거 민원 처리 사례 데이터베이스 (지역·공정 단계별 사례 검색 핵심 테이블)
 * tb_case_example_type / tb_case_example_request 는 1:N 자식 테이블.
 * created_by/updated_by 컬럼이 schema에 없으므로 actor 정보는 ActivityLog로만 기록.
 */
@Entity
@Table(name = "tb_case_example")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CaseExample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_example_id")
    private Long caseExampleId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    @Column(name = "site_name", length = 200, nullable = false)
    private String siteName;

    // REGION_TYPE 코드 (tb_code_master 논리 참조, DB FK 없음)
    @Column(name = "region_code", length = 100, nullable = false)
    private String regionCode;

    // PHASE 코드 (tb_code_master 논리 참조, DB FK 없음)
    @Column(name = "phase_code", length = 100, nullable = false)
    private String phaseCode;

    @Column(name = "complainant", length = 500, nullable = false)
    private String complainant;

    @Column(name = "complaint_content", columnDefinition = "TEXT")
    private String complaintContent;

    @Column(name = "occurrence_date")
    private LocalDate occurrenceDate;

    @Column(name = "progress_code", length = 100)
    private String progressCode;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점
    @Column(name = "details_content", columnDefinition = "TEXT")
    private String detailsContent;

    @Column(name = "compensation_method", length = 100)
    private String compensationMethod;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점
    // 보상 금액 원화, DECIMAL(15,0) — 소수점 없는 정수형 금액
    @Builder.Default
    @Column(name = "compensation_amount", nullable = false, precision = 15, scale = 0)
    private BigDecimal compensationAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

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

    // 유형 배열 — @BatchSize: 목록 조회 시 IN절 배치 쿼리로 N+1 방지 (EntityGraph 동시 fetch 대신)
    @Builder.Default
    @BatchSize(size = 100)
    @OneToMany(mappedBy = "caseExample", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CaseExampleType> caseExampleTypes = new ArrayList<>();

    // 요청내용 배열 — @OrderBy로 DB 조회 시 sort_order 오름차순 보장, @BatchSize로 N+1 방지
    @Builder.Default
    @BatchSize(size = 100)
    @OrderBy("sortOrder ASC")
    @OneToMany(mappedBy = "caseExample", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CaseExampleRequest> caseExampleRequests = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** 사례 등록 팩토리 메서드. created_by/updated_by 컬럼이 없으므로 actor는 ActivityLog로만 기록. */
    public static CaseExample create(CaseExampleCreateRequest request) {
        return CaseExample.builder()
                .firebaseId(request.getFirebaseId())
                .siteName(request.getSiteName())
                .regionCode(request.getRegionCode())
                .phaseCode(request.getPhaseCode())
                .complainant(request.getComplainant())
                .complaintContent(request.getComplaintContent())
                .occurrenceDate(request.getOccurrenceDate())
                .progressCode(request.getProgressCode())
                .detailsContent(request.getDetailsContent())
                .compensationMethod(request.getCompensationMethod())
                .compensationAmount(request.getCompensationAmount() != null
                        ? request.getCompensationAmount() : BigDecimal.ZERO)
                .useYn("Y")
                .deletedYn("N")
                .build();
    }

    /** 사례 정보 수정. updatedAt은 @PreUpdate가 자동 처리. */
    public void updateInfo(CaseExampleUpdateRequest request) {
        this.siteName = request.getSiteName();
        this.firebaseId = request.getFirebaseId();
        this.regionCode = request.getRegionCode();
        this.phaseCode = request.getPhaseCode();
        this.complainant = request.getComplainant();
        this.complaintContent = request.getComplaintContent();
        this.occurrenceDate = request.getOccurrenceDate();
        this.progressCode = request.getProgressCode();
        this.detailsContent = request.getDetailsContent();
        this.compensationMethod = request.getCompensationMethod();
        if (request.getCompensationAmount() != null) {
            this.compensationAmount = request.getCompensationAmount();
        }
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by=actor */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
    }
}
