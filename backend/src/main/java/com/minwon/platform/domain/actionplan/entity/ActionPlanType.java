package com.minwon.platform.domain.actionplan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_action_plan_type (조치방안-유형 매핑) 테이블 매핑 엔티티
 * Firebase actionPlanLinks.types[] 배열을 정규화한 테이블
 * type_code: COMPLAINT_TYPE 코드값 (tb_code_master 참조, FK 아님)
 */
@Entity
@Table(name = "tb_action_plan_type")
@Getter
@NoArgsConstructor
public class ActionPlanType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_plan_type_id")
    private Long actionPlanTypeId;

    // LAZY: 조회 시 ActionPlan을 즉시 로딩하지 않고 실제 접근 시점에만 쿼리 → N+1 방지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_plan_id", nullable = false)
    private ActionPlan actionPlan;

    // COMPLAINT_TYPE 코드값 저장 (tb_code_master 참조, FK 아님)
    @Column(name = "type_code", length = 100, nullable = false)
    private String typeCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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
