package com.minwon.platform.domain.site.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site_complaint_similar_case (현장 민원 유사 사례) 테이블 매핑 엔티티
 * 유사 사례는 별도 테이블 FK 없이 case_text / case_url 직접 저장 방식
 */
@Entity
@Table(name = "tb_site_complaint_similar_case")
@Getter
@NoArgsConstructor
public class SiteComplaintSimilarCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "similar_case_id")
    private Long similarCaseId;

    // LAZY: 조회 시 SiteComplaint를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_complaint_id", nullable = false)
    private SiteComplaint siteComplaint;

    @Column(name = "case_text", columnDefinition = "TEXT", nullable = false)
    private String caseText;

    @Column(name = "case_url", length = 2000)
    private String caseUrl;

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
}
