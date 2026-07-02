package com.minwon.platform.domain.caseexample.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_case_example_type (사례 유형) 테이블 매핑 엔티티.
 * 사례 1건에 여러 유형 코드가 붙을 수 있는 1:N 정규화 테이블.
 */
@Entity
@Table(name = "tb_case_example_type")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CaseExampleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_example_type_id")
    private Long caseExampleTypeId;

    // CaseExample 저장 시 cascade로 함께 저장됨 — LAZY로 N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_example_id", nullable = false)
    private CaseExample caseExample;

    @Column(name = "type_code", length = 100, nullable = false)
    private String typeCode;

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

    /** 유형 생성 팩토리 메서드 */
    public static CaseExampleType of(CaseExample caseExample, String typeCode) {
        CaseExampleType entity = new CaseExampleType();
        entity.caseExample = caseExample;
        entity.typeCode = typeCode;
        return entity;
    }
}
