package com.minwon.platform.domain.guide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * POST /api/v1/response-guides 요청 DTO.
 * regionCode, phaseCode, causeContent, actionContent는 필수.
 */
@Getter
public class ResponseGuideCreateRequest {

    @Size(max = 100, message = "Firebase ID는 100자 이하여야 합니다.")
    private String firebaseId;

    @NotBlank(message = "지역 코드는 필수입니다.")
    @Size(max = 100, message = "지역 코드는 100자 이하여야 합니다.")
    private String regionCode;

    @NotBlank(message = "공정 코드는 필수입니다.")
    @Size(max = 100, message = "공정 코드는 100자 이하여야 합니다.")
    private String phaseCode;

    @NotBlank(message = "원인 내용은 필수입니다.")
    private String causeContent;

    @NotBlank(message = "대응 내용은 필수입니다.")
    private String actionContent;
}
