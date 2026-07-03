package com.minwon.platform.domain.systemsetting.service;

import com.minwon.platform.common.exception.BusinessException;
import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.service.ActivityLogService;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingCreateRequest;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingResponse;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingUpdateRequest;
import com.minwon.platform.domain.systemsetting.entity.SystemSetting;
import com.minwon.platform.domain.systemsetting.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 시스템 설정(SystemSetting) 서비스 — 키-값 방식, ADMIN 전용 도메인.
 * 접근 차단은 SecurityConfig(/api/v1/system-settings/** → ADMIN)에서 처리한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemSettingService {

    // 활동로그 target_site_name — 설정은 현장 개념이 없으므로 고정 표기 (기존 Firebase 기록과 동일)
    private static final String ACTIVITY_TARGET_NAME = "시스템 설정";

    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogService activityLogService;

    /** 설정 목록 조회 — 활성(use_yn=Y) + 미삭제(deleted_yn=N), setting_key 오름차순 */
    public List<SystemSettingResponse> getSystemSettings() {
        log.info("시스템 설정 목록 조회 시작");
        List<SystemSetting> settings =
                systemSettingRepository.findAllByUseYnAndDeletedYnOrderBySettingKeyAsc("Y", "N");
        log.info("시스템 설정 목록 조회 완료: {}건", settings.size());
        return settings.stream().map(SystemSettingResponse::from).toList();
    }

    /** 설정 단건 조회 — 비활성 또는 삭제된 설정은 404 처리 */
    public SystemSettingResponse getSystemSetting(Long systemSettingId) {
        log.info("시스템 설정 상세 조회 시작: systemSettingId={}", systemSettingId);
        SystemSetting setting = systemSettingRepository.findById(systemSettingId)
                .filter(s -> "Y".equals(s.getUseYn()) && "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SYSTEM_SETTING_NOT_FOUND", "시스템 설정을 찾을 수 없습니다."));
        log.info("시스템 설정 상세 조회 완료: systemSettingId={}, settingKey={}",
                setting.getSystemSettingId(), setting.getSettingKey());
        return SystemSettingResponse.from(setting);
    }

    /**
     * 설정 등록.
     * setting_key 유니크 제약이 있으므로 사전 중복 체크 후 저장한다
     * (논리삭제된 행도 유니크 제약에 걸리므로 deleted_yn 조건 없이 확인).
     * 설정 저장 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public SystemSettingResponse createSystemSetting(SystemSettingCreateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("시스템 설정 등록 시작: settingKey={}, actor={}", request.getSettingKey(), actor);

        if (systemSettingRepository.existsBySettingKey(request.getSettingKey())) {
            throw new BusinessException("SYSTEM_SETTING_KEY_DUPLICATED",
                    "이미 존재하는 설정 키입니다: " + request.getSettingKey());
        }

        SystemSetting setting = SystemSetting.create(request, actor);
        SystemSetting saved = systemSettingRepository.save(setting);
        activityLogService.record("CREATE", "tb_system_setting",
                String.valueOf(saved.getSystemSettingId()), ACTIVITY_TARGET_NAME);
        log.info("시스템 설정 등록 완료: systemSettingId={}", saved.getSystemSettingId());
        return SystemSettingResponse.from(saved);
    }

    /**
     * 설정 수정 — settingKey는 변경 불가(식별자 성격), 값/설명/사용여부만 갱신.
     * 삭제된 설정은 수정 불가 (deleted_yn만 확인 — 비활성도 수정 가능하게).
     * 설정 업데이트 + 활동로그 INSERT가 하나의 트랜잭션으로 묶인다.
     */
    @Transactional
    public SystemSettingResponse updateSystemSetting(Long systemSettingId, SystemSettingUpdateRequest request) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("시스템 설정 수정 시작: systemSettingId={}, actor={}", systemSettingId, actor);

        SystemSetting setting = findNotDeletedById(systemSettingId);
        setting.updateInfo(request, actor);

        activityLogService.record("UPDATE", "tb_system_setting",
                String.valueOf(systemSettingId), ACTIVITY_TARGET_NAME);
        log.info("시스템 설정 수정 완료: systemSettingId={}, settingKey={}",
                systemSettingId, setting.getSettingKey());
        return SystemSettingResponse.from(setting);
    }

    /**
     * 설정 논리 삭제.
     * deleted_yn='Y', deleted_at=now(), deleted_by=actor 로 처리. 목록 조회에서 자동 제외된다.
     * 유니크 제약 특성상 삭제된 키는 재등록할 수 없다 (물리 삭제 금지 정책과의 트레이드오프).
     */
    @Transactional
    public void deleteSystemSetting(Long systemSettingId) {
        String actor = CurrentUserProvider.getCurrentActor();
        log.info("시스템 설정 삭제 시작: systemSettingId={}, actor={}", systemSettingId, actor);

        SystemSetting setting = findNotDeletedById(systemSettingId);
        setting.softDelete(actor);

        activityLogService.record("DELETE", "tb_system_setting",
                String.valueOf(systemSettingId), ACTIVITY_TARGET_NAME);
        log.info("시스템 설정 삭제 완료: systemSettingId={}, settingKey={}",
                systemSettingId, setting.getSettingKey());
    }

    /** 미삭제(deleted_yn=N) 설정 단건 조회. 없으면 404. */
    private SystemSetting findNotDeletedById(Long systemSettingId) {
        return systemSettingRepository.findById(systemSettingId)
                .filter(s -> "N".equals(s.getDeletedYn()))
                .orElseThrow(() -> new BusinessException("SYSTEM_SETTING_NOT_FOUND", "시스템 설정을 찾을 수 없습니다."));
    }
}
