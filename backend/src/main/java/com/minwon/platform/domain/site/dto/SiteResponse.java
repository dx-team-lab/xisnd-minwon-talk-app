package com.minwon.platform.domain.site.dto;

import com.minwon.platform.domain.site.entity.Site;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * GET /api/v1/sites, GET /api/v1/sites/{siteId} 공통 응답 DTO.
 * Site 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 */
@Getter
@Builder
public class SiteResponse {

    private Long siteId;
    private String firebaseId;
    private String siteName;
    private String region;
    private String regionTypeCode;
    private Integer completedCount;
    private Integer inProgressCount;
    private String mainContent;
    private Integer sortOrder;
    private String useYn;
    private String createdBy;
    private String updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** Site 엔티티 → SiteResponse DTO 변환 */
    public static SiteResponse from(Site site) {
        return SiteResponse.builder()
                .siteId(site.getSiteId())
                .firebaseId(site.getFirebaseId())
                .siteName(site.getSiteName())
                .region(site.getRegion())
                .regionTypeCode(site.getRegionTypeCode())
                .completedCount(site.getCompletedCount())
                .inProgressCount(site.getInProgressCount())
                .mainContent(site.getMainContent())
                .sortOrder(site.getSortOrder())
                .useYn(site.getUseYn())
                .createdBy(site.getCreatedBy())
                .updatedBy(site.getUpdatedBy())
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
    }
}
