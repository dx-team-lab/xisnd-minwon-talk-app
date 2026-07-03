package com.minwon.platform.domain.site.dto;

import com.minwon.platform.domain.site.entity.SiteComplaintSimilarCase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 현장 민원 유사사례(tb_site_complaint_similar_case) 요청/응답 공용 DTO.
 * 요청 시: caseText 필수. 응답 시: 엔티티 → DTO 변환(from).
 * sortOrder는 서버에서 입력 순서(0-based)로 부여하므로 요청 항목에 포함하지 않는다.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteComplaintSimilarCaseDto {

    @NotBlank(message = "유사사례 내용은 필수입니다.")
    private String caseText;

    @Size(max = 2000, message = "유사사례 URL은 2000자 이하여야 합니다.")
    private String caseUrl;

    /** SiteComplaintSimilarCase 엔티티 → DTO 변환 */
    public static SiteComplaintSimilarCaseDto from(SiteComplaintSimilarCase similarCase) {
        return SiteComplaintSimilarCaseDto.builder()
                .caseText(similarCase.getCaseText())
                .caseUrl(similarCase.getCaseUrl())
                .build();
    }
}
