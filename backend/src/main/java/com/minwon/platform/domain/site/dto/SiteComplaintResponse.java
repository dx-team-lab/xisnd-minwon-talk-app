package com.minwon.platform.domain.site.dto;

import com.minwon.platform.domain.site.entity.SiteComplaint;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * GET /api/v1/sites/{siteId}/complaints, GET .../complaints/{complaintId} 공통 응답 DTO.
 * SiteComplaint 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 */
@Getter
@Builder
public class SiteComplaintResponse {

    private Long siteComplaintId;
    private Long siteId;
    private String firebaseId;
    private String complaintNumber;

    // TODO(3.2-d 후속): 신청인 성명 — 개발자 검토 후 MANAGER 마스킹 적용 지점 — 현재는 그대로 노출
    private String complainant;

    private String usageInfo;

    // TODO(3.2-d 후속): 소유자 정보 — 개발자 검토 후 마스킹 적용 지점 — 현재는 그대로 노출
    private String ownerInfo;

    private String statusCode;
    private String stageCode;
    private String stageOccurrence;
    private String stageResponse;
    private String stageNegotiation;
    private String stageAgreement;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 유사사례 목록 (tb_site_complaint_similar_case, sort_order 오름차순)
    private List<SiteComplaintSimilarCaseDto> similarCases;

    /** SiteComplaint 엔티티 → SiteComplaintResponse DTO 변환 */
    public static SiteComplaintResponse from(SiteComplaint complaint) {
        return SiteComplaintResponse.builder()
                .siteComplaintId(complaint.getSiteComplaintId())
                .siteId(complaint.getSite().getSiteId())
                .firebaseId(complaint.getFirebaseId())
                .complaintNumber(complaint.getComplaintNumber())
                .complainant(complaint.getComplainant())
                .usageInfo(complaint.getUsageInfo())
                .ownerInfo(complaint.getOwnerInfo())
                .statusCode(complaint.getStatusCode())
                .stageCode(complaint.getStageCode())
                .stageOccurrence(complaint.getStageOccurrence())
                .stageResponse(complaint.getStageResponse())
                .stageNegotiation(complaint.getStageNegotiation())
                .stageAgreement(complaint.getStageAgreement())
                .sortOrder(complaint.getSortOrder())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .similarCases(complaint.getSimilarCases().stream()
                        .map(SiteComplaintSimilarCaseDto::from)
                        .toList())
                .build();
    }
}
