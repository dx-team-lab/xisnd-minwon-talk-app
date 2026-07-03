package com.minwon.platform.domain.systemsetting.entity;

import com.minwon.platform.domain.systemsetting.dto.SystemSettingCreateRequest;
import com.minwon.platform.domain.systemsetting.dto.SystemSettingUpdateRequest;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * tb_system_setting (시스템 설정) 테이블 매핑 엔티티 — 키-값 방식.
 * Firebase settings 컬렉션(system/procedure/references 문서의 자유 필드)을 키-값 행으로 전환.
 * setting_key는 유니크(예: MAIN_IMAGE_URL, MAIN_PAGE_THEME, IS_PROCESS_MENU_ENABLED).
 * setting_key는 식별자 성격이므로 수정(updateInfo)에서 변경하지 않는다 — 변경은 삭제+재등록으로.
 * 접근 권한: ADMIN 전용 (security.md 3번 권한표).
 */
@Entity
@Table(name = "tb_system_setting")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "system_setting_id")
    private Long systemSettingId;

    @Column(name = "setting_key", length = 100, nullable = false, unique = true)
    private String settingKey;

    // URL/테마명/true·false 등 문자열로 저장 (타입 해석은 클라이언트 책임)
    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(name = "description", length = 500)
    private String description;

    // 논리 삭제 및 활성화 여부 (Y/N)
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

    // 공통 감사 컬럼
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

    /** 설정 등록: SystemSettingCreateRequest + actor → SystemSetting 엔티티 생성 */
    public static SystemSetting create(SystemSettingCreateRequest request, String actor) {
        return SystemSetting.builder()
                .settingKey(request.getSettingKey())
                .settingValue(request.getSettingValue())
                .description(request.getDescription())
                .useYn(request.getUseYn() != null ? request.getUseYn() : "Y")
                .deletedYn("N")
                .createdBy(actor)
                .updatedBy(actor)
                .build();
    }

    /** 설정 수정: settingKey는 변경하지 않는다. useYn 미전달 시 기존 값 유지. */
    public void updateInfo(SystemSettingUpdateRequest request, String actor) {
        this.settingValue = request.getSettingValue();
        this.description = request.getDescription();
        if (request.getUseYn() != null) {
            this.useYn = request.getUseYn();
        }
        this.updatedBy = actor;
    }

    /** 논리 삭제: deleted_yn='Y', deleted_at=now(), deleted_by/updated_by=actor */
    public void softDelete(String actor) {
        this.deletedYn = "Y";
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = actor;
        this.updatedBy = actor;
    }
}
