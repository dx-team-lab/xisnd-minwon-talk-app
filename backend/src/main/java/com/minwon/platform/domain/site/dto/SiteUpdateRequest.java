package com.minwon.platform.domain.site.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * PUT /api/v1/sites/{siteId} 요청 DTO.
 * siteName은 필수, 나머지는 선택 항목이다.
 */
@Getter
public class SiteUpdateRequest {

    @NotBlank(message = "현장명은 필수입니다.")
    @Size(max = 200, message = "현장명은 200자 이하여야 합니다.")
    private String siteName;

    @Size(max = 100, message = "Firebase ID는 100자 이하여야 합니다.")
    private String firebaseId;

    @Size(max = 200, message = "지역은 200자 이하여야 합니다.")
    private String region;

    @Size(max = 100, message = "지역 유형 코드는 100자 이하여야 합니다.")
    private String regionTypeCode;

    private Integer completedCount;
    private Integer inProgressCount;
    private String mainContent;
    private Integer sortOrder;

    @Pattern(regexp = "^[YN]$", message = "useYn은 Y 또는 N이어야 합니다.")
    private String useYn;
}
