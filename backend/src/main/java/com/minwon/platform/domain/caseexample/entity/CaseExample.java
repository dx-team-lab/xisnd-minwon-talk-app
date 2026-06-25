package com.minwon.platform.domain.caseexample.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * tb_case_example (민원 사례) 테이블 매핑 엔티티
 * 과거 민원 처리 사례 데이터베이스 (지역·공정 단계별 사례 검색 핵심 테이블)
 */
@Entity
@Table(name = "tb_case_example")
@Getter
@NoArgsConstructor
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

    // schema.sql에서 VARCHAR(20) → DATE 로 확정 변경됨 (LocalDate 매핑)
    // ※ Firebase 이관 시 기존 문자열 날짜 데이터('2023-01-05' 등)의 형식 정제가 필요할 수 있음
    @Column(name = "occurrence_date")
    private LocalDate occurrenceDate;

    @Column(name = "progress_code", length = 100)
    private String progressCode;

    @Column(name = "details_content", columnDefinition = "TEXT")
    private String detailsContent;

    @Column(name = "compensation_method", length = 100)
    private String compensationMethod;

    // 보상 금액 원화, DECIMAL(15,0) — 소수점 없는 정수형 금액
    @Column(name = "compensation_amount", nullable = false, precision = 15, scale = 0)
    private BigDecimal compensationAmount = BigDecimal.ZERO;

    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

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
