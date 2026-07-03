package com.minwon.platform.domain.systemsetting.controller;

import com.minwon.platform.common.response.ApiResponse;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingCreateRequest;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingResponse;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingUpdateRequest;
import com.minwon.platform.domain.systemsetting.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 시스템 설정 API — ADMIN 전용 (SecurityConfig에서 /api/v1/system-settings/** → hasRole ADMIN).
 */
@Tag(name = "시스템 설정 API", description = "시스템 설정(tb_system_setting) 키-값 조회 및 등록/수정/삭제 API (ADMIN 전용)")
@RestController
@RequestMapping("/api/v1/system-settings")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @Operation(summary = "시스템 설정 목록 조회",
               description = "활성(use_yn=Y) 시스템 설정 전체 목록을 setting_key 오름차순으로 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getSystemSettings() {
        return ResponseEntity.ok(ApiResponse.ok(systemSettingService.getSystemSettings()));
    }

    @Operation(summary = "시스템 설정 상세 조회",
               description = "systemSettingId로 설정 1건을 조회합니다. 존재하지 않으면 404를 반환합니다.")
    @GetMapping("/{systemSettingId}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> getSystemSetting(
            @PathVariable Long systemSettingId) {
        return ResponseEntity.ok(ApiResponse.ok(systemSettingService.getSystemSetting(systemSettingId)));
    }

    @Operation(summary = "시스템 설정 등록",
               description = "새 설정(키-값)을 등록합니다. settingKey는 필수이며 중복 시 SYSTEM_SETTING_KEY_DUPLICATED를 반환합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<SystemSettingResponse>> createSystemSetting(
            @Valid @RequestBody SystemSettingCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(systemSettingService.createSystemSetting(request)));
    }

    @Operation(summary = "시스템 설정 수정",
               description = "systemSettingId로 설정 값/설명/사용여부를 수정합니다. settingKey는 변경할 수 없습니다.")
    @PutMapping("/{systemSettingId}")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSystemSetting(
            @PathVariable Long systemSettingId,
            @Valid @RequestBody SystemSettingUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok(systemSettingService.updateSystemSetting(systemSettingId, request)));
    }

    @Operation(summary = "시스템 설정 삭제",
               description = "systemSettingId로 설정을 논리 삭제합니다. deleted_yn=Y로 처리되며 이후 목록에서 제외됩니다.")
    @DeleteMapping("/{systemSettingId}")
    public ResponseEntity<ApiResponse<Void>> deleteSystemSetting(@PathVariable Long systemSettingId) {
        systemSettingService.deleteSystemSetting(systemSettingId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
