package com.minwon.platform.domain.site.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site_phase (현장 공정 단계) 테이블 매핑 엔티티
 * 현장(tb_site)에 연결된 공정 단계 코드 목록
 */
@Entity
@Table(name = "tb_site_phase")
@Getter
@NoArgsConstructor
public class SitePhase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_phase_id")
    private Long sitePhaseId;

    // LAZY: 조회 시 Site를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    // PHASE 코드값 저장 (tb_code_master 참조, FK 아님)
    @Column(name = "phase_code", length = 100, nullable = false)
    private String phaseCode;

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
