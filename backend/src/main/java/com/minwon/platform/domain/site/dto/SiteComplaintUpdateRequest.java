package com.minwon.platform.domain.site.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * PUT /api/v1/sites/{siteId}/complaints/{complaintId} 요청 DTO.
 * 수정 시 similarCases는 기존 목록 전체 교체(Replace-all) 방식으로 처리된다.
 * 빈 목록 전달 시 유사사례가 모두 삭제된다.
 */
@Getter
public class SiteComplaintUpdateRequest {

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

    // COMPLAINT_STATUS 코드 — 미전달 시 기존 값 유지
    @Size(max = 100, message = "상태 코드는 100자 이하여야 합니다.")
    private String statusCode;

    @Size(max = 100, message = "단계 코드는 100자 이하여야 합니다.")
    private String stageCode;

    private String stageOccurrence;

    private String stageResponse;

    private String stageNegotiation;

    private String stageAgreement;

    // 미전달 시 기존 값 유지
    private Integer sortOrder;

    // 유사사례 목록 (기존 전체 교체 — 빈 목록 전달 시 전체 삭제)
    @Valid
    private List<SiteComplaintSimilarCaseDto> similarCases = new ArrayList<>();
}
