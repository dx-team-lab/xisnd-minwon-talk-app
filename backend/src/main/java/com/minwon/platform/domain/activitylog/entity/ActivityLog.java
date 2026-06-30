package com.minwon.platform.domain.activitylog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_activity_log (활동 감사 로그) 테이블 매핑 엔티티
 * 사용자의 CREATE/UPDATE/DELETE/RESTORE 작업 이력을 불변 기록으로 관리
 * - updated_at 없음: 감사 로그는 생성 후 수정 불가 (schema.sql 의도적 설계)
 * - before_json / after_json: MySQL JSON 타입으로 변경 전후 데이터 스냅샷 저장
 */
@Entity
@Table(name = "tb_activity_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_log_id")
    private Long activityLogId;

    @Column(name = "actor_email", length = 255, nullable = false)
    private String actorEmail;

    @Column(name = "actor_name", length = 100, nullable = false)
    private String actorName;

    // CREATE / UPDATE / DELETE / RESTORE
    @Column(name = "action_code", length = 20, nullable = false)
    private String actionCode;

    // 대상 테이블명
    @Column(name = "target_table", length = 100, nullable = false)
    private String targetTable;

    // 대상 PK
    @Column(name = "target_pk", length = 100)
    private String targetPk;

    @Column(name = "target_site_name", length = 200)
    private String targetSiteName;

    @Column(name = "target_id", length = 200)
    private String targetId;

    @Column(name = "detail_content", columnDefinition = "TEXT")
    private String detailContent;

    // 변경 전 데이터 스냅샷 (MySQL JSON 타입)
    @Column(name = "before_json", columnDefinition = "JSON")
    private String beforeJson;

    // 변경 후 데이터 스냅샷 (MySQL JSON 타입)
    @Column(name = "after_json", columnDefinition = "JSON")
    private String afterJson;

    // schema.sql 기준 created_at만 존재 (updated_at 없음 — 감사 로그 불변 설계)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
