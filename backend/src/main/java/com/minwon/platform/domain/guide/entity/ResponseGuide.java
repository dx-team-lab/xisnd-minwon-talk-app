package com.minwon.platform.domain.guide.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * tb_response_guide (대응 가이드) 테이블 매핑 엔티티
 * 지역 유형 + 공정 단계 조합별 민원 원인 및 대응 방법 가이드
 */
@Entity
@Table(name = "tb_response_guide")
@Getter
@NoArgsConstructor
public class ResponseGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "response_guide_id")
    private Long responseGuideId;

    @Column(name = "firebase_id", length = 100)
    private String firebaseId;

    // REGION_TYPE 코드 (tb_code_master 논리 참조, DB FK 없음)
    @Column(name = "region_code", length = 100, nullable = false)
    private String regionCode;

    // PHASE 코드 (tb_code_master 논리 참조, DB FK 없음)
    @Column(name = "phase_code", length = 100, nullable = false)
    private String phaseCode;

    @Column(name = "cause_content", columnDefinition = "TEXT", nullable = false)
    private String causeContent;

    @Column(name = "action_content", columnDefinition = "TEXT", nullable = false)
    private String actionContent;

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
