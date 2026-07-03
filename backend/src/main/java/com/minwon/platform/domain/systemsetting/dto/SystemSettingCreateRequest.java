package com.minwon.platform.domain.systemsetting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/**
 * POST /api/v1/system-settings 요청 DTO.
 * settingKey는 필수이며 시스템 전체에서 유니크해야 한다 (중복 시 SYSTEM_SETTING_KEY_DUPLICATED).
 */
@Getter
public class SystemSettingCreateRequest {

    @NotBlank(message = "설정 키는 필수입니다.")
    @Size(max = 100, message = "설정 키는 100자 이하여야 합니다.")
    private String settingKey;

    // URL/테마명/true·false 등 문자열로 저장 — 선택 항목
    private String settingValue;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
    private String description;

    // 미전달 시 'Y' 기본 적용
    @Pattern(regexp = "Y|N", message = "사용 여부는 Y 또는 N이어야 합니다.")
    private String useYn;
}
