package com.minwon.platform.domain.activitylog.service;

import com.minwon.platform.common.util.CurrentUserProvider;
import com.minwon.platform.domain.activitylog.entity.ActivityLog;
import com.minwon.platform.domain.activitylog.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 활동 로그 기록 서비스.
 * 쓰기 API(CREATE/UPDATE/DELETE)가 성공하면 이 서비스를 호출하여 tb_activity_log에 기록을 남긴다.
 * @Transactional 없이 호출 측의 트랜잭션에 자동 참여(Spring 기본 전파: REQUIRED)한다.
 * 따라서 "현장 저장 + 활동로그 INSERT"가 하나의 트랜잭션으로 묶인다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    /**
     * 활동 로그를 기록한다.
     *
     * @param actionCode     CREATE / UPDATE / DELETE
     * @param targetTable    대상 테이블명 (예: "tb_site")
     * @param targetPk       대상 PK 문자열 (예: "42")
     * @param targetSiteName 현장명 (사람이 읽기 쉬운 식별자)
     */
    public void record(String actionCode, String targetTable, String targetPk, String targetSiteName) {
        ActivityLog activityLog = ActivityLog.builder()
                .actorEmail(CurrentUserProvider.getCurrentActorEmail())
                .actorName(CurrentUserProvider.getCurrentActor())
                .actionCode(actionCode)
                .targetTable(targetTable)
                .targetPk(targetPk)
                .targetSiteName(targetSiteName)
                .build();
        activityLogRepository.save(activityLog);
        log.info("활동 로그 기록 완료: actionCode={}, targetTable={}, targetPk={}", actionCode, targetTable, targetPk);
    }
}
