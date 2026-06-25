package com.minwon.platform.domain.site.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site (현장) 테이블 매핑 엔티티
 * 민원·이미지·공정 등 모든 현장 관련 데이터의 최상위 부모 테이블
 */
@Entity
@Table(name = "tb_site")
@Getter
@NoArgsConstructor
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_id")
    private Long siteId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    @Column(name = "site_name", length = 200, nullable = false)
    private String siteName;

    @Column(name = "region", length = 200)
    private String region;

    // REGION_TYPE 코드값 저장 (tb_code_master 참조, FK 아님)
    @Column(name = "region_type_code", length = 100)
    private String regionTypeCode;

    @Column(name = "completed_count", nullable = false)
    private Integer completedCount = 0;

    @Column(name = "in_progress_count", nullable = false)
    private Integer inProgressCount = 0;

    @Column(name = "main_content", columnDefinition = "TEXT")
    private String mainContent;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // 논리 삭제 및 활성화 여부 (Y/N)
    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

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
}
