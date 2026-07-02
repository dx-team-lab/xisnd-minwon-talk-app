package com.minwon.platform.domain.caseexample.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * PUT /api/v1/case-examples/{caseExampleId} 요청 DTO.
 * 수정 시 typeCodes / requestContents 는 기존 목록 전체 교체(Replace-all) 방식으로 처리된다.
 * 빈 목록 전달 시 해당 배열이 모두 삭제된다.
 */
@Getter
public class CaseExampleUpdateRequest {

    @NotBlank(message = "현장명은 필수입니다.")
    @Size(max = 200, message = "현장명은 200자 이하여야 합니다.")
    private String siteName;

    @Size(max = 100, message = "Firebase ID는 100자 이하여야 합니다.")
    private String firebaseId;

    @NotBlank(message = "지역 코드는 필수입니다.")
    @Size(max = 100, message = "지역 코드는 100자 이하여야 합니다.")
    private String regionCode;

    @NotBlank(message = "공정 코드는 필수입니다.")
    @Size(max = 100, message = "공정 코드는 100자 이하여야 합니다.")
    private String phaseCode;

    @NotBlank(message = "민원인은 필수입니다.")
    @Size(max = 500, message = "민원인은 500자 이하여야 합니다.")
    private String complainant;

    private String complaintContent;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate occurrenceDate;

    @Size(max = 100, message = "진행 상태 코드는 100자 이하여야 합니다.")
    private String progressCode;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점
    private String detailsContent;

    @Size(max = 100, message = "보상 방법은 100자 이하여야 합니다.")
    private String compensationMethod;

    // TODO(3.2-d 후속): 개발자 검토 후 MANAGER 마스킹 적용 지점
    private BigDecimal compensationAmount;

    // 유형 코드 목록 (기존 전체 교체 — 빈 목록 전달 시 전체 삭제)
    private List<String> typeCodes = new ArrayList<>();

    // 요청 내용 목록 (기존 전체 교체 — 빈 목록 전달 시 전체 삭제)
    private List<String> requestContents = new ArrayList<>();
}
