package com.minwon.platform.domain.guide.entity;

import com.minwon.platform.domain.guide.dto.ResponseGuideCreateRequest;
import com.minwon.platform.domain.guide.dto.ResponseGuideUpdateRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_response_guide (대응 가이드) 테이블 매핑 엔티티.
 * 지역 유형 + 공정 단계 조합별 민원 원인 및 대응 방법 가이드.
 * created_by/updated_by 컬럼이 schema에 없으므로 actor 정보는 ActivityLog로만 기록.
 */
@Entity
@Table(name = "tb_response_guide")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
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

    @Builder.Default
    @Column(name = "use_yn", columnDefinition = "CHAR(1)", nullable = false)
    private String useYn = "Y";

    @Builder.Default
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

    /** 대응가이드 등록 팩토리 메서드. created_by/updated_by 컬럼이 없으므로 actor는 ActivityLog로만 기록. */
    public static ResponseGuide create(ResponseGuideCreateRequest request) {
        return ResponseGuide.builder()
                .firebaseId(request.getFirebaseId())
                .regionCode(request.getRegionCode())
                .phaseCode(request.getPhaseCode())
                .causeContent(request.getCauseContent())
                .actionContent(request.getActionContent())
                .useYn("Y")
                .deletedYn("N")
                .build();
    }

    /** 대응가이드 정보 수정. updatedAt은 @PreUpdate가 자동 처리. */
    public void updateInfo(ResponseGuideUpdateRequest request) {
        this.firebaseId = request.getFirebaseId();
        this.regionCode = request.getRegionCode();
        this.phaseCode = request.getPhaseCode();
        this.causeContent = request.getCauseContent();
        this.actionContent = request.getActionContent();
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by=actor */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
    }
}
