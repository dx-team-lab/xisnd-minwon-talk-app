package com.minwon.platform.domain.actionplan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_action_plan (조치방안) 테이블 매핑 엔티티
 * Firebase actionPlanLinks 컬렉션 → MySQL 전환
 * 유형(다중)은 tb_action_plan_type으로 정규화
 * 지역/단계/주요내용은 tb_response_plan_v2에 있음 (별도 테이블)
 */
@Entity
@Table(name = "tb_action_plan")
@Getter
@NoArgsConstructor
public class ActionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_plan_id")
    private Long actionPlanId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    @Column(name = "plan_title", length = 500, nullable = false)
    private String planTitle;

    // SharePoint 문서 링크 (선택 항목)
    @Column(name = "share_point_url", length = 2000)
    private String sharePointUrl;

    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

    @Column(name = "deleted_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String deletedYn = "N";

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by", length = 100)
    private String deletedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
