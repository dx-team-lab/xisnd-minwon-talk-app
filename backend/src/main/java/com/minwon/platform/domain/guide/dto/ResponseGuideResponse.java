package com.minwon.platform.domain.guide.dto;

import com.minwon.platform.domain.guide.entity.ResponseGuide;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * GET /api/v1/response-guides, GET /api/v1/response-guides/{responseGuideId} 공통 응답 DTO.
 * ResponseGuide 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 */
@Getter
@Builder
public class ResponseGuideResponse {

    private Long responseGuideId;
    private String firebaseId;
    private String regionCode;
    private String phaseCode;
    private String causeContent;
    private String actionContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** ResponseGuide 엔티티 → ResponseGuideResponse DTO 변환 */
    public static ResponseGuideResponse from(ResponseGuide responseGuide) {
        return ResponseGuideResponse.builder()
                .responseGuideId(responseGuide.getResponseGuideId())
                .firebaseId(responseGuide.getFirebaseId())
                .regionCode(responseGuide.getRegionCode())
                .phaseCode(responseGuide.getPhaseCode())
                .causeContent(responseGuide.getCauseContent())
                .actionContent(responseGuide.getActionContent())
                .createdAt(responseGuide.getCreatedAt())
                .updatedAt(responseGuide.getUpdatedAt())
                .build();
    }
}
