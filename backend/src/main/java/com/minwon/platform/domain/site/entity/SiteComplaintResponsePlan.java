package com.minwon.platform.domain.site.entity;

import com.minwon.platform.domain.actionplan.entity.ActionPlan;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_site_complaint_response_plan (현장 민원-조치방안 연결) 테이블 매핑 엔티티
 * FK 2개: site_complaint_id(tb_site_complaint), action_plan_id(tb_action_plan)
 * plan_title: 마이그레이션 시 데이터 이관용 임시 컬럼 (schema.sql 정의 기준)
 */
@Entity
@Table(name = "tb_site_complaint_response_plan")
@Getter
@NoArgsConstructor
public class SiteComplaintResponsePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "complaint_response_plan_id")
    private Long complaintResponsePlanId;

    // LAZY: 조회 시 SiteComplaint를 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_complaint_id", nullable = false)
    private SiteComplaint siteComplaint;

    // LAZY: 조회 시 ActionPlan을 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_plan_id", nullable = false)
    private ActionPlan actionPlan;

    // 마이그레이션 시 데이터 이관용 임시 컬럼 (schema.sql 정의 기준 유지)
    @Column(name = "plan_title", length = 500)
    private String planTitle;

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
