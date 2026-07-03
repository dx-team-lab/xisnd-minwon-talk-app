package com.minwon.platform.domain.systemsetting.dto;

import com.minwon.platform.domain.systemsetting.entity.SystemSetting;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * GET /api/v1/system-settings, GET /api/v1/system-settings/{systemSettingId} 공통 응답 DTO.
 * SystemSetting 엔티티를 직접 노출하지 않고 이 DTO로 변환해서 반환한다.
 * deleted_yn, deleted_at, deleted_by 등 내부 삭제 관리 필드는 제외.
 */
@Getter
@Builder
public class SystemSettingResponse {

    private Long systemSettingId;
    private String settingKey;
    private String settingValue;
    private String description;
    private String useYn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** SystemSetting 엔티티 → SystemSettingResponse DTO 변환 */
    public static SystemSettingResponse from(SystemSetting setting) {
        return SystemSettingResponse.builder()
                .systemSettingId(setting.getSystemSettingId())
                .settingKey(setting.getSettingKey())
                .settingValue(setting.getSettingValue())
                .description(setting.getDescription())
                .useYn(setting.getUseYn())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}
