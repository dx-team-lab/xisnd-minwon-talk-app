package com.minwon.platform.domain.site.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * POST /api/v1/sites/{siteId}/complaints 요청 DTO.
 * complaintNumber, complainant는 필수. siteId는 경로 변수로 받으므로 본문에 포함하지 않는다.
 * similarCases는 선택 항목 (빈 목록 허용).
 */
@Getter
public class SiteComplaintCreateRequest {

    @Size(max = 100, message = "Firebase ID는 100자 이하여야 합니다.")
    private String firebaseId;

    @NotBlank(message = "민원번호는 필수입니다.")
    @Size(max = 50, message = "민원번호는 50자 이하여야 합니다.")
    private String complaintNumber;

    // TODO(3.2-d 후속): 신청인 성명 — 개발자 검토 후 MANAGER 마스킹 적용 지점
    @NotBlank(message = "신청인은 필수입니다.")
    @Size(max = 500, message = "신청인은 500자 이하여야 합니다.")
    private String complainant;

    private String usageInfo;

    // TODO(3.2-d 후속): 소유자 정보 — 개인정보 포함 가능, 개발자 검토 후 마스킹 적용 지점
    private String ownerInfo;

    // COMPLAINT_STATUS 코드 — 미전달 시 IN_PROGRESS 기본 적용
    @Size(max = 100, message = "상태 코드는 100자 이하여야 합니다.")
    private String statusCode;

    @Size(max = 100, message = "단계 코드는 100자 이하여야 합니다.")
    private String stageCode;

    private String stageOccurrence;

    private String stageResponse;

    private String stageNegotiation;

    private String stageAgreement;

    // 미전달 시 0 기본 적용
    private Integer sortOrder;

    // 유사사례 목록 — 선택 항목, 입력 순서대로 sort_order 부여
    @Valid
    private List<SiteComplaintSimilarCaseDto> similarCases = new ArrayList<>();
}
