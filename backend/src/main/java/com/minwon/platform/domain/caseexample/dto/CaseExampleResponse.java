package com.minwon.platform.domain.caseexample.dto;

import com.minwon.platform.domain.caseexample.entity.CaseExample;
import com.minwon.platform.domain.caseexample.entity.CaseExampleRequest;
import com.minwon.platform.domain.caseexample.entity.CaseExampleType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * GET /api/v1/case-examples, GET /api/v1/case-examples/{caseExampleId} 공통 응답 DTO.
 * CaseExample 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 */
@Getter
@Builder
public class CaseExampleResponse {

    private Long caseExampleId;
    private String firebaseId;
    private String siteName;
    private String regionCode;
    private String phaseCode;
    private String complainant;
    private String complaintContent;
    private LocalDate occurrenceDate;
    private String progressCode;
    private String compensationMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점 — 현재는 그대로 노출
    private String detailsContent;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점 — 현재는 그대로 노출
    private BigDecimal compensationAmount;

    // 유형 코드 목록 (tb_case_example_type)
    private List<String> typeCodes;

    // 요청 내용 목록 (tb_case_example_request, sort_order 오름차순)
    private List<String> requestContents;

    /** CaseExample 엔티티 → CaseExampleResponse DTO 변환 */
    public static CaseExampleResponse from(CaseExample caseExample) {
        return CaseExampleResponse.builder()
                .caseExampleId(caseExample.getCaseExampleId())
                .firebaseId(caseExample.getFirebaseId())
                .siteName(caseExample.getSiteName())
                .regionCode(caseExample.getRegionCode())
                .phaseCode(caseExample.getPhaseCode())
                .complainant(caseExample.getComplainant())
                .complaintContent(caseExample.getComplaintContent())
                .occurrenceDate(caseExample.getOccurrenceDate())
                .progressCode(caseExample.getProgressCode())
                .detailsContent(caseExample.getDetailsContent())
                .compensationMethod(caseExample.getCompensationMethod())
                .compensationAmount(caseExample.getCompensationAmount())
                .createdAt(caseExample.getCreatedAt())
                .updatedAt(caseExample.getUpdatedAt())
                .typeCodes(caseExample.getCaseExampleTypes().stream()
                        .map(CaseExampleType::getTypeCode)
                        .toList())
                .requestContents(caseExample.getCaseExampleRequests().stream()
                        .sorted(Comparator.comparing(CaseExampleRequest::getSortOrder))
                        .map(CaseExampleRequest::getRequestContent)
                        .toList())
                .build();
    }
}
