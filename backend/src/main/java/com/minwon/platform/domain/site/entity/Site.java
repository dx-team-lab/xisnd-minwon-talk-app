package com.minwon.platform.domain.site.entity;

import com.minwon.platform.domain.site.dto.SiteCreateRequest;
import com.minwon.platform.domain.site.dto.SiteUpdateRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_site (현장) 테이블 매핑 엔티티
 * 민원·이미지·공정 등 모든 현장 관련 데이터의 최상위 부모 테이블
 */
@Entity
@Table(name = "tb_site")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
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

    @Builder.Default
    @Column(name = "completed_count", nullable = false)
    private Integer completedCount = 0;

    @Builder.Default
    @Column(name = "in_progress_count", nullable = false)
    private Integer inProgressCount = 0;

    @Column(name = "main_content", columnDefinition = "TEXT")
    private String mainContent;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    // 논리 삭제 및 활성화 여부 (Y/N)
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

    /** 현장 등록: SiteCreateRequest + actor → Site 엔티티 생성 */
    public static Site create(SiteCreateRequest request, String actor) {
        return Site.builder()
                .firebaseId(request.getFirebaseId())
                .siteName(request.getSiteName())
                .region(request.getRegion())
                .regionTypeCode(request.getRegionTypeCode())
                .completedCount(request.getCompletedCount() != null ? request.getCompletedCount() : 0)
                .inProgressCount(request.getInProgressCount() != null ? request.getInProgressCount() : 0)
                .mainContent(request.getMainContent())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .useYn("Y")
                .deletedYn("N")
                .createdBy(actor)
                .updatedBy(actor)
                .build();
    }

    /** 현장 정보 수정: 전달된 값으로 필드를 갱신한다. updatedAt은 @PreUpdate가 자동 처리. */
    public void updateInfo(SiteUpdateRequest request, String actor) {
        this.siteName = request.getSiteName();
        this.firebaseId = request.getFirebaseId();
        this.region = request.getRegion();
        this.regionTypeCode = request.getRegionTypeCode();
        if (request.getCompletedCount() != null) this.completedCount = request.getCompletedCount();
        if (request.getInProgressCount() != null) this.inProgressCount = request.getInProgressCount();
        this.mainContent = request.getMainContent();
        if (request.getSortOrder() != null) this.sortOrder = request.getSortOrder();
        if (request.getUseYn() != null) this.useYn = request.getUseYn();
        this.updatedBy = actor;
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by/updated_by=actor */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
        this.updatedBy = actor;
    }
}
