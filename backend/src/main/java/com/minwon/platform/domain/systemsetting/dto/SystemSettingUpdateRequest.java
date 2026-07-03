package com.minwon.platform.domain.systemsetting.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * PUT /api/v1/system-settings/{systemSettingId} 요청 DTO.
 * settingKey는 식별자 성격이므로 수정 대상이 아니다 (본문에 포함하지 않음).
 * 키 변경이 필요하면 삭제 후 재등록으로 처리한다.
 */
@Getter
public class SystemSettingUpdateRequest {

    // URL/테마명/true·false 등 문자열로 저장 — null 전달 시 값 비움
    private String settingValue;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
    private String description;

    // 미전달 시 기존 값 유지
    @Pattern(regexp = "Y|N", message = "사용 여부는 Y 또는 N이어야 합니다.")
    private String useYn;
}
