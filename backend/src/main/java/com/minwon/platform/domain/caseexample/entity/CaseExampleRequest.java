package com.minwon.platform.domain.caseexample.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_case_example_request (사례 요청내용) 테이블 매핑 엔티티.
 * 사례 1건에 여러 요청 내용이 붙을 수 있는 1:N 정규화 테이블.
 * sort_order: 입력 순서(0-based)로 정렬하여 조회 시 원래 순서 유지.
 */
@Entity
@Table(name = "tb_case_example_request")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CaseExampleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "case_example_request_id")
    private Long caseExampleRequestId;

    // CaseExample 저장 시 cascade로 함께 저장됨 — LAZY로 N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_example_id", nullable = false)
    private CaseExample caseExample;

    @Column(name = "request_content", columnDefinition = "TEXT", nullable = false)
    private String requestContent;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

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

    /** 요청내용 생성 팩토리 메서드. sortOrder는 입력 순서(0-based)로 지정한다. */
    public static CaseExampleRequest of(CaseExample caseExample, String requestContent, int sortOrder) {
        CaseExampleRequest entity = new CaseExampleRequest();
        entity.caseExample = caseExample;
        entity.requestContent = requestContent;
        entity.sortOrder = sortOrder;
        return entity;
    }
}
