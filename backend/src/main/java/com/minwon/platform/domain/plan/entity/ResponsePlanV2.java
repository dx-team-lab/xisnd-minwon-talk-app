package com.minwon.platform.domain.plan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_response_plan_v2 (대응방안 v2) 테이블 매핑 엔티티
 * 카테고리별 대응방안 문서 및 SharePoint 링크 관리
 * region_code / stage_code 기본값 'ALL' = 지역·단계 무관 전체 적용
 */
@Entity
@Table(name = "tb_response_plan_v2")
@Getter
@NoArgsConstructor
public class ResponsePlanV2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "response_plan_v2_id")
    private Long responsePlanV2Id;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    @Column(name = "category", length = 200, nullable = false)
    private String category;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "share_point_url", length = 2000)
    private String sharePointUrl;

    // REGION_TYPE 코드 (기본값 'ALL' = 지역 무관 전체 적용)
    @Column(name = "region_code", length = 100, nullable = false)
    private String regionCode = "ALL";

    // 공정 단계 코드 (기본값 'ALL' = 단계 무관 전체 적용)
    @Column(name = "stage_code", length = 100, nullable = false)
    private String stageCode = "ALL";

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
