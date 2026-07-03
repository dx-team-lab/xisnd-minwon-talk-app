package com.minwon.platform.domain.systemsetting.repository;

import com.minwon.platform.domain.systemsetting.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    // use_yn='Y' + deleted_yn='N' 인 설정만 setting_key 오름차순으로 조회
    List<SystemSetting> findAllByUseYnAndDeletedYnOrderBySettingKeyAsc(String useYn, String deletedYn);

    // 키-값 방식이므로 setting_key로도 단건 조회 가능
    Optional<SystemSetting> findBySettingKeyAndDeletedYn(String settingKey, String deletedYn);

    // 등록 시 중복 키 사전 체크 — 유니크 제약은 논리삭제된 행에도 걸리므로 deleted_yn 조건 없이 확인
    boolean existsBySettingKey(String settingKey);
}
